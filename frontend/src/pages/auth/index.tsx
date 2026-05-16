import { authModalState } from "@/atoms/authModalAtom";
import AuthModal from "@/components/Modals/AuthModal";
import Navbar from "@/components/Navbar/Navbar";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
type AuthPageProps = {};

const AuthPage: React.FC<AuthPageProps> = () => {
	// Split read/write hooks so the page mirrors the pattern used by every
	// other consumer of authModalState (Navbar, Topbar, Login, Signup). Using
	// `useRecoilState` here previously broke under HMR with
	// "Invalid argument to useRecoilState: expected an atom or selector".
	const authModal = useRecoilValue(authModalState);
	const setAuthModal = useSetRecoilState(authModalState);
	const [user, loading, error] = useAuthState(auth);
	const [pageLoading, setPageLoading] = useState(true);
	const router = useRouter();

	// Seed the modal open on mount — a direct visit to /auth (Topbar link,
	// bookmark, refresh) otherwise shows only the gradient background because
	// authModalState defaults to isOpen=false.
	useEffect(() => {
		setAuthModal((prev) => (prev.isOpen ? prev : { ...prev, isOpen: true }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (user) router.push("/");
		if (!loading && !user) setPageLoading(false);
	}, [user, router, loading]);

	if (pageLoading) return null;

	return (
		<div className='bg-gradient-to-b from-gray-600 to-black h-screen relative'>
			<div className='max-w-7xl mx-auto'>
				<Navbar />
				<div className='flex items-center justify-center h-[calc(100vh-5rem)] pointer-events-none select-none'>
					<Image src='/hero.png' alt='Hero img' width={700} height={700} />
				</div>
				{authModal.isOpen && <AuthModal />}
			</div>
		</div>
	);
};
export default AuthPage;
