import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
	id: string;
	title: string;
	image_url: string;
	price: number;
	quantity: number;
}

interface CartContext {
	products: Product[];
	addToCart(item: Omit<Product, 'quantity'>): void;
	increment(id: string): void;
	decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		async function loadProducts(): Promise<void> {
			const storedProducts = await AsyncStorage.getItem('@GoMarketplace:products');
			if (storedProducts) {
				setProducts(JSON.parse(storedProducts));
			}
		}
		loadProducts();
	}, []);

	const addToCart = useCallback(
		product => {
			let updatedProducts = [];

			const productExists = products.some(prod => prod.id === product.id);
			if (productExists) {
				updatedProducts = products.map(prod =>
					prod.id === product.id ? { ...prod, quantity: prod.quantity + 1 } : prod,
				);
			} else {
				updatedProducts = [...products, { ...product, quantity: 1 }];
			}

			setProducts(updatedProducts);
			AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(updatedProducts));
		},
		[products],
	);

	const increment = useCallback(
		id => {
			const updatedProducts = products.map(prod =>
				prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
			);
			setProducts(updatedProducts);
			AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(updatedProducts));
		},
		[products],
	);

	const decrement = useCallback(
		id => {
			const updatedProducts = products
				.map(prod => (prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod))
				.filter(prod => prod.quantity > 0);
			setProducts(updatedProducts);
			AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(updatedProducts));
		},
		[products],
	);

	const value = React.useMemo(() => ({ addToCart, increment, decrement, products }), [
		products,
		addToCart,
		increment,
		decrement,
	]);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
	const context = useContext(CartContext);

	if (!context) {
		throw new Error(`useCart must be used within a CartProvider`);
	}

	return context;
}

export { CartProvider, useCart };
