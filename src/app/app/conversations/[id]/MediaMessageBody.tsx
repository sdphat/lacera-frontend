import React from 'react';
import { DefaultExtensionType, FileIcon, defaultStyles } from 'react-file-icon';
import { FiDownload } from 'react-icons/fi';
import byteSize from 'byte-size';

export interface MediaMessageBodyProps {
  progress: number;
  fileName: string;
  size: number;
  onDownloadFile: () => void;
}

const MediaMessageBody: React.FC<MediaMessageBodyProps> = ({
  fileName,
  size,
  progress,
  onDownloadFile,
}) => {
  const extension = fileName.split('.').pop() as DefaultExtensionType;
  const sizeStr = byteSize(size);
  const downloadSize = byteSize(size * progress);

  return (
    <div className="relative w-96 py-4">
      <div className="flex">
        <div className="flex-none w-12">
          <FileIcon extension={extension} {...defaultStyles[extension]} />
        </div>
        <div className="ml-4 py-1 text-sm overflow-hidden whitespace-nowrap">
          <div className="font-semibold overflow-hidden text-ellipsis">{fileName}</div>
          <div className="mt-1 text-xs overflow-hidden text-ellipsis">
            {progress < 1 && `${downloadSize.toString()} / ${sizeStr.toString()}`}
            {progress === 1 && sizeStr.toString()}
          </div>
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => onDownloadFile()}
          className="self-center rounded-md ml-2 p-1 border border-gray-300 text-black bg-white right-2"
        >
          <FiDownload />
        </button>
      </div>
    </div>
  );
};

export default MediaMessageBody;
