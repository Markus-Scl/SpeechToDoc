import {useState} from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import AudioUploader from './components/AudioUploader';

function App() {
	const [count, setCount] = useState(0);

	return (
		<div>
			<FileUploader />
			<AudioUploader />
		</div>
	);
}

export default App;
