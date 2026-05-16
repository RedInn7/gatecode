import { atom, RecoilState } from "recoil";

type AuthModalState = {
	isOpen: boolean;
	type: "login" | "register" | "forgotPassword";
};

const initalAuthModalState: AuthModalState = {
	isOpen: false,
	type: "login",
};

// Cache the atom on globalThis so HMR / strict-mode re-evaluations don't
// register a second instance — Recoil's duplicate-key guard would otherwise
// return a non-RecoilState placeholder that crashes useRecoilState consumers.
declare global {
	// eslint-disable-next-line no-var
	var __gatecodeAuthModalAtom: RecoilState<AuthModalState> | undefined;
}

export const authModalState: RecoilState<AuthModalState> =
	globalThis.__gatecodeAuthModalAtom ??
	(globalThis.__gatecodeAuthModalAtom = atom<AuthModalState>({
		key: "authModalState",
		default: initalAuthModalState,
	}));
