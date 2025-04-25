import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { FolderPlus, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { AddToClosetDialog } from './AddToClosetDialog';

interface Closet {
  id: string;
  name: string;
  description: string;
  _count?: {
    items: number;
  };
}

export function ClosetList() {
  const [closets, setClosets] = useState<Closet[]>([]);
  const [loading, setLoading] = useState(true);
  const [newClosetName, setNewClosetName] = useState('');
  const [newClosetDescription, setNewClosetDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchClosets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setClosets([]);
        setLoading(false);
        return;
      }

      // Get closets with item count
      const { data, error } = await supabase
        .from('closets')
        .select(`
          *,
          _count: closet_items(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const closetsWithCount = data.map(closet => ({
        ...closet,
        _count: {
          items: closet._count[0].count
        }
      }));
      
      setClosets(closetsWithCount);
    } catch (error) {
      console.error('Error fetching closets:', error);
      toast.error('Failed to load closets');
    } finally {
      setLoading(false);
    }
  };

  const createCloset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClosetName.trim()) return;

    setCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create a closet');
        return;
      }

      const { error } = await supabase
        .from('closets')
        .insert([
          {
            user_id: user.id,
            name: newClosetName.trim(),
            description: newClosetDescription.trim() || null,
          },
        ]);

      if (error) throw error;

      toast.success('Closet created successfully');
      setNewClosetName('');
      setNewClosetDescription('');
      fetchClosets();
    } catch (error) {
      console.error('Error creating closet:', error);
      toast.error('Failed to create closet');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchClosets();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchClosets();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading closets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Closet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createCloset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newClosetName}
                onChange={(e) => setNewClosetName(e.target.value)}
                placeholder="My Favorite Outfits"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newClosetDescription}
                onChange={(e) => setNewClosetDescription(e.target.value)}
                placeholder="A collection of my favorite outfits"
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Closet
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {closets.map((closet) => (
          <Card key={closet.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Folder className="w-5 h-5 mr-2" />
                {closet.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {closet.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {closet.description}
                </p>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {closet._count?.items || 0} items
                </p>
                <AddToClosetDialog
                  closetId={closet.id}
                  closetName={closet.name}
                  onItemAdded={fetchClosets}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}