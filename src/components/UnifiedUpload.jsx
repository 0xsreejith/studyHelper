import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiCheckCircle, FiUploadCloud, FiX } from 'react-icons/fi';
import './UnifiedUpload.css';

const UnifiedUpload = ({ onFileSelect, multiple = false, maxFiles = 1, className = '' }) => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    const onDrop = useCallback(acceptedFiles => {
        setError(null);
        
        if (acceptedFiles.length > 0) {
            setFiles(multiple ? acceptedFiles : [acceptedFiles[0]]);
            if (onFileSelect) onFileSelect(multiple ? acceptedFiles : acceptedFiles[0]);
        }
    }, [onFileSelect, multiple]);

    const onDropRejected = useCallback((rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError('Invalid file type. Please upload a PDF or DOCX file.');
            } else if (rejection.errors[0]?.code === 'file-too-large') {
                setError('File is too large. Maximum size is 50MB.');
            } else {
                setError('File upload failed. Please try again.');
            }
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        },
        maxFiles,
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    const removeFile = (index) => {
        const newFiles = multiple ? files.filter((_, i) => i !== index) : [];
        setFiles(newFiles);
        if (onFileSelect) onFileSelect(multiple ? newFiles : (newFiles[0] || null));
        setError(null);
    };

    return (
        <div className={`unified-upload-container ${className}`}>
            {error && (
                <div className="upload-error">
                    <span>⚠️ {error}</span>
                    <button onClick={() => setError(null)} className="error-close">
                        <FiX />
                    </button>
                </div>
            )}
            
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'drag-active' : ''} ${isDragAccept ? 'drag-accept' : ''} ${isDragReject ? 'drag-reject' : ''}`}
            >
                <input {...getInputProps()} />

                {files.length > 0 ? (
                    <div className="file-success">
                        <div className="icon-wrapper success-glow">
                            <FiCheckCircle className="upload-icon text-gradient" />
                        </div>
                        <div className="file-list">
                            {files.map((file, index) => (
                                <div key={index} className="file-item">
                                    <div className="file-details">
                                        <h4>{file.name}</h4>
                                        <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                    <button 
                                        className="btn-icon remove-btn" 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            removeFile(index); 
                                        }}
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {multiple && (
                            <button className="btn-secondary add-more-btn">
                                Add More Files
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className={`icon-wrapper ${isDragActive ? 'floating' : ''}`}>
                            <FiUploadCloud className="upload-icon" />
                        </div>
                        <h3>📁 Upload Your PDF File</h3>
                        <p>Drag & Drop your PDF here OR click the button below</p>
                        <div className="file-types">
                            <span className="file-type">✅ PDF files</span>
                            <span className="file-type">✅ DOCX files</span>
                        </div>
                        <div className="divider"><span>OR</span></div>
                        <button className="btn-primary browse-btn">
                            📂 Choose PDF File
                        </button>
                        <div className="upload-steps">
                            <h4>📋 Simple Steps:</h4>
                            <ol>
                                <li>Click "Choose PDF File" button</li>
                                <li>Select your PDF from computer</li>
                                <li>Choose translation mode below</li>
                                <li>Click "Start Processing"</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnifiedUpload;
