import { createClientSupabaseClient } from '@/lib/supabase/client';
import { ShareTokenManager } from '@/lib/tokens/share-token';
import type { 
  SharedLinkCreateOptions, 
  SharedLinkData, 
  SharedLinkPermission,
  TokenValidationResult 
} from '@/lib/tokens/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Database row structure
interface SharedLinkRow {
  id: string;
  calendar_id: string;
  user_id: string | null;
  token: string | null; // Legacy UUID tokens
  token_random: string | null; // New secure token random component
  token_version: number;
  permissions: SharedLinkPermission;
  password_hash: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Extended shared link data with database metadata
export interface SharedLinkRecord extends SharedLinkData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SharedLinksDatabase {
  private _supabase?: SupabaseClient;

  /**
   * Get Supabase client (lazy-loaded)
   */
  private get supabase() {
    if (!this._supabase) {
      this._supabase = createClientSupabaseClient();
    }
    return this._supabase;
  }

  /**
   * Create a new shared link with secure token
   */
  async createSharedLink(options: SharedLinkCreateOptions): Promise<{
    record: SharedLinkRecord;
    token: string;
  }> {
    // Generate secure token
    const token = ShareTokenManager.generate({ calendarId: options.calendarId });
    const tokenValidation = ShareTokenManager.validate(token);
    
    if (!tokenValidation.isValid || !tokenValidation.randomComponent) {
      throw new Error('Failed to generate valid token');
    }

    // Hash password if provided
    let passwordHash: string | null = null;
    if (options.password) {
      passwordHash = await this.hashPassword(options.password);
    }

    // Insert into database
    const { data, error } = await this.supabase
      .from('shared_links')
      .insert({
        calendar_id: options.calendarId,
        user_id: options.userId,
        token_random: tokenValidation.randomComponent,
        token_version: 2, // Secure token version
        permissions: options.permissions || 'view',
        password_hash: passwordHash,
        expires_at: options.expiresAt?.toISOString() || null,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create shared link: ${error.message}`);
    }

    return {
      record: this.mapRowToRecord(data),
      token: token
    };
  }

  /**
   * Find shared link by token and validate access
   */
  async findByToken(token: string, password?: string): Promise<{
    record: SharedLinkRecord | null;
    validation: TokenValidationResult;
  }> {
    // Validate token structure and extract components
    const validation = ShareTokenManager.validate(token);
    
    if (!validation.isValid || !validation.randomComponent) {
      return { record: null, validation };
    }

    // Query database for the random component
    const { data, error } = await this.supabase
      .from('shared_links')
      .select('*')
      .eq('token_random', validation.randomComponent)
      .eq('token_version', 2)
      .single();

    if (error || !data) {
      return { 
        record: null, 
        validation: { ...validation, isValid: false } 
      };
    }

    const record = this.mapRowToRecord(data);

    // Check if link has expired
    if (record.expiresAt && new Date() > record.expiresAt) {
      return { 
        record: null, 
        validation: { ...validation, isValid: false } 
      };
    }

    // Check password if required
    if (record.passwordHash && password) {
      const passwordValid = await this.verifyPassword(password, record.passwordHash);
      if (!passwordValid) {
        return { 
          record: null, 
          validation: { ...validation, isValid: false } 
        };
      }
    } else if (record.passwordHash && !password) {
      // Password required but not provided
      return { 
        record: null, 
        validation: { ...validation, isValid: false, requiresPassword: true } 
      };
    }

    return { record, validation };
  }

  /**
   * List all shared links for a calendar
   */
  async listByCalendar(calendarId: string, userId: string): Promise<SharedLinkRecord[]> {
    const { data, error } = await this.supabase
      .from('shared_links')
      .select('*')
      .eq('calendar_id', calendarId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch shared links: ${error.message}`);
    }

    return data?.map(row => this.mapRowToRecord(row)) || [];
  }

  /**
   * Update shared link permissions or settings
   */
  async updateSharedLink(
    id: string, 
    updates: Partial<Pick<SharedLinkCreateOptions, 'permissions' | 'password' | 'expiresAt'>>
  ): Promise<SharedLinkRecord> {
    const updateData: Partial<SharedLinkRow> = {};

    if (updates.permissions) {
      updateData.permissions = updates.permissions;
    }

    if (updates.password !== undefined) {
      updateData.password_hash = updates.password 
        ? await this.hashPassword(updates.password) 
        : null;
    }

    if (updates.expiresAt !== undefined) {
      updateData.expires_at = updates.expiresAt?.toISOString() || null;
    }

    const { data, error } = await this.supabase
      .from('shared_links')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update shared link: ${error.message}`);
    }

    return this.mapRowToRecord(data);
  }

  /**
   * Delete a shared link
   */
  async deleteSharedLink(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('shared_links')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete shared link: ${error.message}`);
    }
  }

  /**
   * Clean up expired links (maintenance function)
   */
  async cleanupExpiredLinks(): Promise<number> {
    const { data, error } = await this.supabase
      .from('shared_links')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to cleanup expired links: ${error.message}`);
    }

    return data?.length || 0;
  }

  /**
   * Get shared link analytics/usage stats
   */
  async getCalendarSharingStats(calendarId: string, userId: string): Promise<{
    totalLinks: number;
    activeLinks: number;
    expiredLinks: number;
    passwordProtectedLinks: number;
  }> {
    const { data, error } = await this.supabase
      .from('shared_links')
      .select('expires_at, password_hash')
      .eq('calendar_id', calendarId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch sharing stats: ${error.message}`);
    }

    const now = new Date();
    const stats = (data || []).reduce((acc: {
      totalLinks: number;
      activeLinks: number;
      expiredLinks: number;
      passwordProtectedLinks: number;
    }, link: { expires_at: string | null; password_hash: string | null }) => {
      acc.totalLinks++;
      
      const isExpired = link.expires_at && new Date(link.expires_at) <= now;
      if (isExpired) {
        acc.expiredLinks++;
      } else {
        acc.activeLinks++;
      }
      
      if (link.password_hash) {
        acc.passwordProtectedLinks++;
      }
      
      return acc;
    }, {
      totalLinks: 0,
      activeLinks: 0,
      expiredLinks: 0,
      passwordProtectedLinks: 0,
    });

    return stats;
  }

  /**
   * Map database row to SharedLinkRecord
   */
  private mapRowToRecord(row: SharedLinkRow): SharedLinkRecord {
    return {
      id: row.id,
      calendarId: row.calendar_id,
      userId: row.user_id,
      permissions: row.permissions,
      passwordHash: row.password_hash,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Hash password using Web Crypto API
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashedPassword = await this.hashPassword(password);
    return hashedPassword === hash;
  }
}

// Export a function to create the database instance
export function createSharedLinksDatabase() {
  return new SharedLinksDatabase();
}

// Export singleton instance (but don't instantiate it at module level)
export const sharedLinksDB = {
  getInstance: () => new SharedLinksDatabase()
}; 