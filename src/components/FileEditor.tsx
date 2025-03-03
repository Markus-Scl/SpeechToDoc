import {useState} from 'react';

interface FileEditorProps {
	uploadedFile: File | null;
}
const FileEditor = ({uploadedFile}: FileEditorProps) => {
	const [file, setFile] = useState<File | null>(uploadedFile);

	return (
		<div>
			<div tabIndex={0} className="collapse collapse-plus bg-base-100 border-base-300 border">
				<div className="collapse-title font-semibold">How do I create an account?</div>
				<div className="collapse-content text-sm">Click the "Sign Up" button in the top right corner and follow the registration process.</div>
			</div>
		</div>
	);
};

export default FileEditor;
