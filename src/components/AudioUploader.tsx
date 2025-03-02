import {useState, useRef} from 'react';
import {Mic, Stop, CloudUpload, Delete} from '@mui/icons-material';

const AudioUploader = () => {
	const [audioFile, setAudioFile] = useState<File | null>(null);
	const [audioURL, setAudioURL] = useState<string | null>(null);
	const [isRecording, setIsRecording] = useState(false);
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
	const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile && validateFile(selectedFile)) {
			const objectURL = URL.createObjectURL(selectedFile);
			setAudioFile(selectedFile);
			setAudioURL(objectURL);
		}
	};

	const validateFile = (file: File) => {
		const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
		if (!allowedTypes.includes(file.type)) {
			alert('Only MP3, WAV, and OGG files are allowed!');
			return false;
		}
		return true;
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile && validateFile(droppedFile)) {
			const objectURL = URL.createObjectURL(droppedFile);
			setAudioFile(droppedFile);
			setAudioURL(objectURL);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const startRecording = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({audio: true});
			const recorder = new MediaRecorder(stream);
			let chunks: BlobPart[] = [];

			recorder.ondataavailable = (event) => {
				chunks.push(event.data);
			};

			recorder.onstop = () => {
				const audioBlob = new Blob(chunks, {type: 'audio/wav'});
				setAudioBlob(audioBlob);
				const objectURL = URL.createObjectURL(audioBlob);
				setAudioURL(objectURL);
				setAudioFile(null);
			};

			recorder.start();
			setMediaRecorder(recorder);
			setIsRecording(true);
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	};

	const stopRecording = () => {
		mediaRecorder?.stop();
		setIsRecording(false);
	};

	const handleRemoveFile = (event: React.MouseEvent) => {
		event.stopPropagation();
		setAudioFile(null);
		setAudioURL(null);
		setAudioBlob(null);
	};

	return (
		<div className="flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto bg-base-100 shadow-xl rounded-xl mt-10">
			{/* Upload Area */}
			<div
				className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-all"
				onClick={() => fileInputRef.current?.click()}
				onDrop={handleDrop}
				onDragOver={handleDragOver}>
				{audioURL ? (
					<div className="flex flex-col items-center space-y-3">
						<p className="text-sm font-medium text-gray-600">{audioFile?.name || 'Recorded Audio'}</p>
						<audio ref={audioRef} src={audioURL} controls></audio>
						<div className="flex gap-2">
							<button className="btn btn-error btn-sm flex items-center gap-1" onClick={handleRemoveFile}>
								<Delete fontSize="small" />
								Remove
							</button>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center space-y-3">
						<CloudUpload className="text-accent" fontSize="large" />
						<p className="text-sm text-gray-500">Drag & drop an audio file here</p>
						<p className="text-sm text-gray-400">or click to browse</p>
					</div>
				)}
			</div>

			{/* Hidden File Input */}
			<input type="file" ref={fileInputRef} accept="audio/mpeg, audio/wav, audio/ogg" className="hidden" onChange={handleFileChange} />

			{/* Record Button */}
			<button
				className={`btn btn-accent mt-4 w-full flex items-center justify-center gap-2 transition-all ${isRecording ? 'animate-pulse' : ''}`}
				onClick={isRecording ? stopRecording : startRecording}>
				{isRecording ? <Stop fontSize="small" /> : <Mic fontSize="small" />}
				{isRecording ? 'Stop Recording' : 'Start Recording'}
			</button>

			{/* Textarea for Speech-to-Text */}
			<textarea className="textarea textarea-bordered w-full mt-4 textarea-accent" rows={4} placeholder="Speech-to-text will appear here..."></textarea>
		</div>
	);
};

export default AudioUploader;
