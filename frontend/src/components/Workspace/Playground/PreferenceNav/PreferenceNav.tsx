import { useState, useEffect, useRef } from "react";
import { AiOutlineFullscreen, AiOutlineFullscreenExit, AiOutlineSetting } from "react-icons/ai";
import { ISettings } from "../Playground";
import SettingsModal from "@/components/Modals/SettingsModal";

type PreferenceNavProps = {
	settings: ISettings;
	setSettings: React.Dispatch<React.SetStateAction<ISettings>>;
	availableLanguages: string[];
	selectedLanguage: string;
	onLanguageChange: (lang: string) => void;
};

const PreferenceNav: React.FC<PreferenceNavProps> = ({
	setSettings,
	settings,
	availableLanguages,
	selectedLanguage,
	onLanguageChange,
}) => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleFullScreen = () => {
		if (isFullScreen) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
		setIsFullScreen(!isFullScreen);
	};

	useEffect(() => {
		function exitHandler() {
			if (!document.fullscreenElement) {
				setIsFullScreen(false);
			} else {
				setIsFullScreen(true);
			}
		}
		if (document.addEventListener) {
			document.addEventListener("fullscreenchange", exitHandler);
			document.addEventListener("webkitfullscreenchange", exitHandler);
			document.addEventListener("mozfullscreenchange", exitHandler);
			document.addEventListener("MSFullscreenChange", exitHandler);
		}
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className='flex items-center justify-between bg-dark-layer-2 h-11 w-full border-b border-dark-divider-border-2'>
			<div className='flex items-center text-gray-800'>
				<div className='relative' ref={dropdownRef}>
					<button
						className='flex cursor-pointer items-center rounded focus:outline-none bg-dark-fill-3 text-dark-label-2 hover:bg-dark-fill-2 px-2 py-1.5 font-medium'
						onClick={() => setDropdownOpen((o) => !o)}
					>
						<div className='flex items-center px-1'>
							<div className='text-xs text-label-2 dark:text-dark-label-2'>{selectedLanguage}</div>
							<svg className='ml-1 h-3 w-3 fill-current' viewBox='0 0 20 20'>
								<path d='M5.516 7.548c.436-.446 1.043-.481 1.576 0L10 10.405l2.908-2.857c.533-.481 1.14-.446 1.576 0 .436.445.408 1.197 0 1.615l-3.696 3.572a1.077 1.077 0 01-1.576 0L5.516 9.163c-.408-.418-.436-1.17 0-1.615z' />
							</svg>
						</div>
					</button>
					{dropdownOpen && (
						<div className='absolute top-full left-0 mt-1 w-40 bg-dark-layer-1 border border-dark-divider-border-2 rounded shadow-lg z-50 max-h-72 overflow-y-auto'>
							{availableLanguages.map((lang) => (
								<div
									key={lang}
									className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-dark-fill-2 ${
										lang === selectedLanguage ? "text-white font-semibold" : "text-dark-label-2"
									}`}
									onClick={() => {
										onLanguageChange(lang);
										setDropdownOpen(false);
									}}
								>
									{lang}
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			<div className='flex items-center m-2'>
				<button
					className='preferenceBtn group'
					onClick={() => setSettings({ ...settings, settingsModalIsOpen: true })}
				>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						<AiOutlineSetting />
					</div>
					<div className='preferenceBtn-tooltip'>Settings</div>
				</button>

				<button className='preferenceBtn group' onClick={handleFullScreen}>
					<div className='h-4 w-4 text-dark-gray-6 font-bold text-lg'>
						{!isFullScreen ? <AiOutlineFullscreen /> : <AiOutlineFullscreenExit />}
					</div>
					<div className='preferenceBtn-tooltip'>Full Screen</div>
				</button>
			</div>
			{settings.settingsModalIsOpen && <SettingsModal settings={settings} setSettings={setSettings} />}
		</div>
	);
};
export default PreferenceNav;
