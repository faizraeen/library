import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

const TransactionLink = ({ hash, blockNumber, className = '' }) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-gray-400 text-xs">N/A</span>;

  const truncate = (str) => {
    if (!str || str.length <= 14) return str;
    return `${str.slice(0, 8)}...${str.slice(-6)}`;
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const etherscanUrl = `https://sepolia.etherscan.io/tx/${hash}`;

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      <a
        href={etherscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={`View transaction on Sepolia Etherscan:\n${hash}`}
        className="text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1 font-medium bg-forest-50/70 hover:bg-forest-100/70 px-2 py-0.5 rounded transition-colors"
      >
        <span>{truncate(hash)}</span>
        <ExternalLink className="w-3 h-3 text-forest-600" />
      </a>

      <button
        onClick={handleCopy}
        title="Copy full transaction hash"
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>

      {blockNumber && (
        <span className="text-[10px] text-gray-400 ml-0.5">
          #{blockNumber}
        </span>
      )}
    </div>
  );
};

export default TransactionLink;
