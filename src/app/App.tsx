"use client"
import { useEffect, useState } from 'react';;

import { DoorOpen } from 'lucide-react'
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { AddItemForm } from '../components/AddItemForm';
import { WardrobeGrid } from '../components/WardrobeGrid';
import { AuthForm } from '../components/auth/AuthForm';
import { ThemeToggle } from '../components/ui/theme-toggle';
import type { User } from '@supabase/supabase-js';



interface Category {
	id: string;
	name: string;
}

interface ClothingItem {
	id: string;
	name: string;
	url: string;
	image_url: string;
	price: number;
	description: string;
	category: { name: string };
}

const containerVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.6,
			ease: "easeOut"
		}
	}
};

function App() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [items, setItems] = useState<ClothingItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [isFormVisible, setIsFormVisible] = useState(false); // State to manage form visibility
	const [metaData, setMetaData] = useState<{
		name: string;
		description: string;
		image: string;
	} | null>(null);

	const fetchCategories = async () => {
		try {
			const { data, error } = await supabase
				.from('categories')
				.select('*')
				.order('name');

			if (error) throw error;
			setCategories(data || []);
		} catch (error) {
			console.error('Error fetching categories:', error);
		}
	};

	const fetchItems = async () => {
		if (!user) {
			setItems([]);
			setLoading(false);
			return;
		}

		try {
			const { data, error } = await supabase
				.from('clothing_items')
				.select(`
          *,
          category:categories(name)
        `)
				.order('created_at', { ascending: false });

			if (error) throw error;
			setItems(data || []);
		} catch (error) {
			console.error('Error fetching items:', error);
		} finally {
			setLoading(false);
		}
	};

	//fetch meta data
	const fetchMetaData = async (url: string) => {
		if (!url) {
			console.error("URL is required for fetching metadata");
			return null;
		}

		try {
			// Ensure the URL is correctly encoded and safe for the API call
			const encodedUrl = encodeURIComponent(url);
			const response = await fetch(`/api/extractMeta?url=${encodedUrl}`);

			if (!response.ok) {
				throw new Error(`Error fetching metadata: ${response.statusText}`);
			}

			const data = await response.json();
			return data; // Assuming the API returns the relevant metadata
		} catch (error) {
			console.error("Error fetching metadata:", error);
			return null;
		}
	};

	const handleFetchMetaData = async (url: string) => {
		const data = await fetchMetaData(url);
		if (data) {
			setMetaData(data);
		}
	};
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setUser(session?.user ?? null);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	useEffect(() => {
		const initData = async () => {
			await fetchCategories();
			await fetchItems();
		};

		initData();
	}, [user]);

	// Function to toggle the visibility of the form
	const toggleFormVisibility = () => {
		setIsFormVisible(!isFormVisible);
	};

	return (
		<div className="min-h-screen bg-background">
			<Toaster position="top-right" />

			<header className="border-b backdrop-blur-sm bg-background/50 sticky top-0 z-50">
				<div className="container py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<DoorOpen className="w-8 h-8 text-danger mr-3" />
							<h1 className="text-3xl font-semibold tracking-tight">
								Closet Link
							</h1>
						</div>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main className="container py-8 space-y-8">
				{user ? (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-8"
					>
						<div className="grid grid-cols-1 gap-8">
							{/* Button to toggle the AddItemForm visibility */}
							<button
								onClick={toggleFormVisibility}
								
								className="bg-blue-500 text-white px-4 w-64 py-2 rounded-lg"
							>
								{isFormVisible ? "Close Form" : "Add New Item"}
							</button>

							{/* Conditionally render the AddItemForm */}
							{isFormVisible && (
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.2 }}
									className="glass-effect rounded-2xl p-6"
								>
									<h2 className="text-2xl font-semibold mb-6">Add New Item</h2>
									<AddItemForm
										categories={categories}
										onItemAdded={fetchItems}
									/>
								</motion.div>
							)}
						</div>

						{loading ? (
							<div className="text-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
								<p className="mt-4 text-muted-foreground">Loading your wardrobe...</p>
							</div>
						) : items.length === 0 ? (
							<div className="text-center py-12 glass-effect rounded-2xl">
								<p className="text-muted-foreground">No items in your wardrobe yet. Add some above!</p>
							</div>
						) : (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="glass-effect rounded-2xl p-6"
							>
								<h2 className="text-2xl font-semibold mb-6">All Items</h2>
								<WardrobeGrid
									items={items}
									onItemDeleted={fetchItems}
								/>
							</motion.div>
						)}
					</motion.div>
				) : (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="max-w-md mx-auto"
					>
						<AuthForm />
					</motion.div>
				)}
			</main>
		</div>
	);
}

export default App;