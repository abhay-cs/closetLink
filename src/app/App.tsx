"use client"
import { useEffect, useState } from 'react';;

import { DoorOpen } from 'lucide-react'
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { AuthForm } from '../components/auth/AuthForm';
import { ThemeToggle } from '../components/ui/theme-toggle';
import type { User } from '@supabase/supabase-js';




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

	const [user, setUser] = useState<User | null>(null);




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


	return (
		<div className="min-h-screen bg-background">
			<header className="border-b backdrop-blur-sm bg-background/50 sticky top-0 z-50">
				<div className="container py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<DoorOpen className="w-8 h-8 text-danger mr-3" />
							<h1 className="text-3xl font-semibold tracking-tight">
								Closet Link
							</h1>
						</div>
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