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

	const editor = useEditor({
		extensions: [
			StarterKit,
			Heading.configure({
				levels: [1, 2, 3],
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
			editor.commands.setContent(docContent.html);
		}
	}, [docContent.html, editor]);

	const parseDocx = async (file: File) => {
		setLoading(true);
		setError(null);
		try {
			const arrayBuffer = await file.arrayBuffer();
			const result = await mammoth.convertToHtml({arrayBuffer});
			setDocContent({html: result.value});
		} catch (error) {
			console.error('Error parsing document:', error);
			setError('Failed to parse the document.');
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
			.then((blob: Blob) => saveAs(blob, 'edited-document.docx'))
			.catch((error: unknown) => {
				console.error('Error generating document:', error);
				alert('Failed to generate document.');
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
				case 'STRONG':
					elements.push(
						new Paragraph({
							children: [new TextRun({text: node.textContent || '', bold: true})],
						})
					);
					break;
				case 'EM':
					elements.push(
						new Paragraph({
							children: [new TextRun({text: node.textContent || '', italics: true})],
						})
					);
					break;
			}
		});
		return elements;
	};

	return (
		<div className="w-3/4 h-full p-5 max-w-4xl mx-auto">
			<h2 className="text-2xl font-bold mb-5 text-accent">Edit Your Word Document</h2>

			{error ? (
				<div className="alert alert-error mb-4 animate-fade-in">
					<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					<span>{error}</span>
				</div>
			) : loading ? (
				<div className="flex justify-center items-center h-64">
					<span className="loading loading-spinner text-accent text-4xl"></span>
				</div>
			) : (
				<div className="space-y-4">
					{editor && (
						<div className="bg-base-200 p-3 rounded-lg border border-accent shadow-md flex flex-wrap gap-2">
							<button
								onClick={() => editor.chain().focus().toggleHeading({level: 1}).run()}
								className={`btn btn-sm transition-colors duration-200 ${editor.isActive('heading', {level: 1}) ? 'btn-accent' : 'btn-ghost'}`}>
								H1
							</button>
							<button
								onClick={() => editor.chain().focus().toggleHeading({level: 2}).run()}
								className={`btn btn-sm transition-colors duration-200 ${editor.isActive('heading', {level: 2}) ? 'btn-accent' : 'btn-ghost'}`}>
								H2
							</button>
							<button
								onClick={() => editor.chain().focus().toggleBold().run()}
								className={`btn btn-sm transition-colors duration-200 ${editor.isActive('bold') ? 'btn-accent' : 'btn-ghost'}`}>
								Bold
							</button>
							<button
								onClick={() => editor.chain().focus().toggleItalic().run()}
								className={`btn btn-sm transition-colors duration-200 ${editor.isActive('italic') ? 'btn-accent' : 'btn-ghost'}`}>
								Italic
							</button>
							<button
								onClick={() => editor.chain().focus().toggleBulletList().run()}
								className={`btn btn-sm transition-colors duration-200 ${editor.isActive('bulletList') ? 'btn-accent' : 'btn-ghost'}`}>
								List
							</button>
							<button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="btn btn-sm btn-ghost transition-colors duration-200">
								Clear
							</button>
						</div>
					)}

					<div className="bg-base-100 max-h-[400px] overflow-y-auto border border-accent rounded-lg p-4 shadow-inner">
						<EditorContent editor={editor} className="prose max-w-none" />
					</div>

					<button
						onClick={generateDocx}
						disabled={!docContent.html || loading}
						className="btn btn-accent w-full py-3 transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
						Generate Word Document
					</button>
				</div>
			)}
		</div>
	);
};

export default WordEditor;
