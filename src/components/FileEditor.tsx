import {useState} from 'react';

interface FileEditorProps {
	uploadedFile: File | null;
}
const FileEditor = ({uploadedFile}: FileEditorProps) => {
	const [file, setFile] = useState<File | null>(uploadedFile);

	return (
		<div>
			<h1>My File Editor</h1>
		</div>
	);
};

export default FileEditor;
