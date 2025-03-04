import React, {useState} from 'react';
import {Document, Packer, Paragraph, TextRun} from 'docx';
import {saveAs} from 'file-saver';

const WordEditor: React.FC = () => {
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');

	const generateDocx = () => {
		// Create a new Document
		const doc = new Document({
			sections: [
				{
					properties: {},
					children: [
						new Paragraph({
							children: [
								new TextRun({
									text: title,
									bold: true,
									size: 24, // Font size in half-points (24 = 12pt)
								}),
							],
						}),
						new Paragraph({
							children: [new TextRun(content)],
						}),
					],
				},
			],
		});

		// Generate the .docx file as a Blob
		Packer.toBlob(doc)
			.then((blob) => {
				saveAs(blob, 'generated-document.docx');
			})
			.catch((error) => {
				console.error('Error generating document:', error);
				alert('Failed to generate the document.');
			});
	};

	return (
		<div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
			<h2>Create a Word Document</h2>
			<div style={{marginBottom: '15px'}}>
				<label htmlFor="title">Title:</label>
				<input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter document title" style={{width: '100%', padding: '8px', marginTop: '5px'}} />
			</div>
			<div style={{marginBottom: '15px'}}>
				<label htmlFor="content">Content:</label>
				<textarea
					id="content"
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Enter document content"
					rows={10}
					style={{width: '100%', padding: '8px', marginTop: '5px'}}
				/>
			</div>
			<button
				onClick={generateDocx}
				disabled={!title || !content} // Disable if fields are empty
				style={{
					padding: '10px 20px',
					backgroundColor: '#007bff',
					color: 'white',
					border: 'none',
					borderRadius: '5px',
					cursor: 'pointer',
				}}>
				Generate Word Document
			</button>
		</div>
	);
};

export default WordEditor;
