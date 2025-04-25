import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ClothingItem {
  id: string;
  name: string;
  image_url: string | null;
  category: { name: string };
}

interface AddToClosetDialogProps {
  closetId: string;
  closetName: string;
  onItemAdded: () => void;
}

export function AddToClosetDialog({ closetId, closetName, onItemAdded }: AddToClosetDialogProps) {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableItems();
    }
  }, [open]);

  const fetchAvailableItems = async () => {
    try {
      const { data: items, error: itemsError } = await supabase
        .from('clothing_items')
        .select(`
          id,
          name,
          image_url,
          category:categories(name)
        `);

      if (itemsError) throw itemsError;

      // Get existing items in the closet
      const { data: existingItems, error: existingError } = await supabase
        .from('closet_items')
        .select('clothing_item_id')
        .eq('closet_id', closetId);

      if (existingError) throw existingError;

      // Filter out items that are already in the closet
      const existingIds = new Set(existingItems.map(item => item.clothing_item_id));
      const availableItems = items.filter(item => !existingIds.has(item.id));

      setItems(availableItems);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load available items');
    } finally {
      setLoading(false);
    }
  };

  const addItemToCloset = async (itemId: string) => {
    setAdding(itemId);
    try {
      const { error } = await supabase
        .from('closet_items')
        .insert([
          {
            closet_id: closetId,
            clothing_item_id: itemId
          }
        ]);

      if (error) throw error;

      toast.success('Item added to closet');
      onItemAdded();
      
      // Remove the added item from the list
      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error adding item to closet:', error);
      toast.error('Failed to add item to closet');
    } finally {
      setAdding(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Items
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Items to {closetName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Loading items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No items available to add</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="h-16 w-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.category.name}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => addItemToCloset(item.id)}
                  disabled={adding === item.id}
                >
                  {adding === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}