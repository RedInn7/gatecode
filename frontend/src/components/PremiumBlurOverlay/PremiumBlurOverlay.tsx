import React from "react";
import { BsLock } from "react-icons/bs";

type PremiumBlurOverlayProps = {
	isLocked: boolean;
	visibleLines?: number;
	ctaText?: string;
	onCtaClick?: () => void;
	children: React.ReactNode;
};

const PremiumBlurOverlay: React.FC<PremiumBlurOverlayProps> = ({
	isLocked,
	visibleLines = 6,
	ctaText = "开通 VIP 解锁完整内容",
	onCtaClick,
	children,
}) => {
	if (!isLocked) return <>{children}</>;

	return (
		<div className="relative overflow-hidden" style={{ maxHeight: `${visibleLines * 24}px` }}>
			{children}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex items-end justify-center pb-4">
				<button
					onClick={onCtaClick}
					className="flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-brand-orange-s transition-colors"
				>
					<BsLock className="text-sm" />
					{ctaText}
				</button>
			</div>
		</div>
	);
};

export default PremiumBlurOverlay;
