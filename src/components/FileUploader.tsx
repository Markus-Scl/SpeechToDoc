import {useState, useRef} from 'react';
import {CloudUpload, Description, PictureAsPdf, Delete} from '@mui/icons-material';

interface FileUploaderProps {
	onFileUpload: (file: File) => void; // Prop type for the upload handler
}

const FileUploader = ({onFileUpload}: FileUploaderProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile && validateFile(selectedFile)) {
			setFile(selectedFile);
			onFileUpload(selectedFile);
		}
	};

	const validateFile = (file: File) => {
		const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
		if (!allowedTypes.includes(file.type)) {
			alert('Only PDF and Word documents are allowed!');
			return false;
		}
		return true;
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile && validateFile(droppedFile)) {
			setFile(droppedFile);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleRemoveFile = () => {
		setFile(null);
	};

	return (
		<div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto bg-base-100 shadow-xl rounded-xl">
			<div
				className={`border-2 border-dashed rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer transition-all ${
					isDragging ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
				}`}
				onClick={() => fileInputRef.current?.click()}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}>
				{file ? (
					<div className="flex flex-col items-center space-y-3">
						{file.type === 'application/pdf' ? <PictureAsPdf className="text-red-500" fontSize="large" /> : <Description className="text-blue-500" fontSize="large" />}
						<p className="text-sm font-medium text-gray-600">{file.name}</p>
						<button
							className="btn btn-error btn-xs mt-2 flex items-center gap-1"
							onClick={(e) => {
								e.stopPropagation();
								handleRemoveFile();
							}}>
							<Delete fontSize="small" />
							Remove
						</button>
					</div>
				) : (
					<div className="flex flex-col items-center space-y-3">
						<CloudUpload className="text-accent" fontSize="large" />
						<p className="text-sm text-gray-500">Drag & drop a PDF/Word file here</p>
						<p className="text-sm text-gray-400">or click to browse</p>
					</div>
				)}
			</div>

			<input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
		</div>
	);
};

export default FileUploader;
