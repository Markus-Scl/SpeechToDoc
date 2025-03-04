import {useState} from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import AudioUploader from './components/AudioUploader';
import FileEditor from './components/FileEditor';
import WordEditor from './components/WordEditor';

function App() {
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);

	const handleFileUpload = (file: File) => {
		setUploadedFile(file);
	};

	return (
		<div className="flex flex-row justify-center items-center h-full w-full">
			<div className="w-1/4 bg-teal-100 p-4 shadow-xl rounded-xl flex flex-col justify center">
				<FileUploader onFileUpload={handleFileUpload} />
				<AudioUploader />
			</div>
			<div className="w-2/4 h-7/10 bg-teal-100 p-4 shadow-xl rounded-xl flex flex-col justify center ml-10">
				<WordEditor />
			</div>
		</div>
	);
}

export default App;
