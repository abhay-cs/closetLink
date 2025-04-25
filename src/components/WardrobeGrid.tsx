import React from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

interface ClothingItem {
  id: string;
  name: string;
  url: string;
  image_url: string;
  price: number;
  description: string;
  category: { name: string };
}

export function WardrobeGrid({ 
  items, 
  onItemDeleted 
}: { 
  items: ClothingItem[],
  onItemDeleted: () => void
}) {
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Item deleted successfully');
      onItemDeleted();
    } catch (error) {
      toast.error('Failed to delete item');
      console.error('Error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="aspect-square relative bg-muted">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          
          <CardHeader className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-none">{item.name}</h3>
                <Badge variant="secondary">{item.category.name}</Badge>
              </div>
              {item.price && (
                <span className="font-medium">
                  ${item.price.toFixed(2)}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            )}
          </CardHeader>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                View <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(item.id)}
              title="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}