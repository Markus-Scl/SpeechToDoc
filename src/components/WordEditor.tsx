import React, {useState, useEffect} from 'react';
import mammoth from 'mammoth';
import {Document, Packer, Paragraph, TextRun, HeadingLevel} from 'docx';
import {saveAs} from 'file-saver';
import {useEditor, EditorContent} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';

interface WordEditorProps {
	uploadedFile: File | null;
}

interface DocContent {
	html: string;
}

const WordEditor: React.FC<WordEditorProps> = ({uploadedFile}) => {
	const [docContent, setDocContent] = useState<DocContent>({html: ''});
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize TipTap editor
	const editor = useEditor({
		extensions: [
			StarterKit, // Basic features: bold, italic, paragraphs, lists, etc.
			Heading.configure({
				levels: [1, 2, 3], // Support H1, H2, H3
			}),
		],
		content: docContent.html,
		onUpdate: ({editor}) => {
			setDocContent({html: editor.getHTML()});
		},
	});

	useEffect(() => {
		if (uploadedFile) {
			if (!uploadedFile.name.endsWith('.docx')) {
				setError('Please upload a valid .docx file.');
				return;
			}
			parseDocx(uploadedFile);
		}
	}, [uploadedFile]);

	useEffect(() => {
		if (editor && docContent.html) {
			editor.commands.setContent(docContent.html); // Update editor when content changes
		}
	}, [docContent.html, editor]);

	const parseDocx = async (file: File) => {
		setLoading(true);
		setError(null);
		try {
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.convertToHtml({arrayBuffer});
			const html: string = result.value;
			setDocContent({html});
		} catch (error) {
			console.error('Error parsing document:', error);
			setError('Failed to parse the document. Ensure it’s a valid .docx file.');
		} finally {
			setLoading(false);
		}
	};

	const generateDocx = () => {
		const doc = new Document({
			sections: [
				{
					properties: {},
					children: htmlToDocxElements(docContent.html),
				},
			],
		});

		Packer.toBlob(doc)
			.then((blob: Blob) => {
				saveAs(blob, 'edited-document.docx');
			})
			.catch((error: unknown) => {
				console.error('Error generating document:', error);
				alert('Failed to generate the document.');
			});
	};

	const htmlToDocxElements = (html: string): any[] => {
		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const elements: any[] = [];

		doc.body.childNodes.forEach((node) => {
			switch (node.nodeName) {
				case 'H1':
					elements.push(
						new Paragraph({
							children: [new TextRun({text: node.textContent || '', bold: true, size: 32})],
							heading: HeadingLevel.HEADING_1,
						})
					);
					break;
				case 'H2':
					elements.push(
						new Paragraph({
							children: [new TextRun({text: node.textContent || '', bold: true, size: 28})],
							heading: HeadingLevel.HEADING_2,
						})
					);
					break;
				case 'P':
					elements.push(
						new Paragraph({
							children: [new TextRun(node.textContent || '')],
						})
					);
					break;
				// Add more cases (e.g., STRONG, UL, LI) as needed
			}
		});

		return elements;
	};

	return (
		<div className="p-5 max-w-4xl mx-auto">
			<h2 className="text-2xl font-bold mb-5 text-accent">Edit Your Word Document</h2>

			{error ? (
				<div className="alert alert-error mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			) : loading ? (
				<div className="flex justify-center">
					<span className="loading loading-spinner text-accent"></span>
				</div>
			) : (
				<div className="space-y-4">
					{/* TipTap Toolbar */}
					{editor && (
						<div className="flex flex-wrap gap-2 mb-2 bg-base-200 p-2 rounded-lg border border-accent">
							<button
								onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
								className={`btn btn-sm ${editor.isActive('heading', {level: 1}) ? 'btn-accent' : 'btn-ghost'}`}>
								H1
							</button>
							<button
								onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
								className={`btn btn-sm ${editor.isActive('heading', {level: 2}) ? 'btn-accent' : 'btn-ghost'}`}>
								H2
							</button>
							<button onClick={() => editor.chain().focus().toggleBold().run()} className={`btn btn-sm ${editor.isActive('bold') ? 'btn-accent' : 'btn-ghost'}`}>
								Bold
							</button>
							<button onClick={() => editor.chain().focus().toggleItalic().run()} className={`btn btn-sm ${editor.isActive('italic') ? 'btn-accent' : 'btn-ghost'}`}>
								Italic
							</button>
							<button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`btn btn-sm ${editor.isActive('bulletList') ? 'btn-accent' : 'btn-ghost'}`}>
								List
							</button>
							<button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="btn btn-sm btn-ghost">
								Clear
							</button>
						</div>
					)}

					{/* TipTap Editor */}
					<div className="bg-base-100 border border-accent rounded-lg p-4">
						<EditorContent editor={editor} />
					</div>

					{/* Generate Button */}
					<button onClick={generateDocx} disabled={!docContent.html || loading} className="btn btn-accent w-full">
						Generate Word Document
					</button>
				</div>
			)}
		</div>
	);
};

export default WordEditor;
