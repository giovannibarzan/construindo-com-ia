
import React from 'react';

interface BreadcrumbProps {
    items: Array<{
        label: string;
        icon?: string;
        onClick?: () => void;
    }>;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <span className="material-symbols-outlined !text-base">chevron_right</span>
                    )}
                    {item.onClick ? (
                        <button
                            onClick={item.onClick}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            {item.icon && (
                                <span className="material-symbols-outlined !text-base">{item.icon}</span>
                            )}
                            {item.label}
                        </button>
                    ) : (
                        <span className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                            {item.icon && (
                                <span className="material-symbols-outlined !text-base">{item.icon}</span>
                            )}
                            {item.label}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default Breadcrumb;
