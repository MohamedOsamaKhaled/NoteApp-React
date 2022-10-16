import React, { useState, useEffect } from 'react';
import './App.css';
import NotesContainer from './components/Notes/NotesContainer';
import NotesList from './components/Notes/NotesList';
import Note from './components/Notes/Note';
import NoteForm from './components/Notes/NoteForm';
import Preview from './components/Preview';
import Message from './components/Message';
import Alert from './components/Alert';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('notes')) {
      setNotes(JSON.parse(localStorage.getItem('notes')));
    } else {
      localStorage.setItem('notes', JSON.stringify([]));
      setNotes([]);
    }
  }, []);

  useEffect(() => {
    if (validationErrors.length !== 0) {
      setTimeout(() => {
        setValidationErrors([]);
      }, 3000);
    }
  }, [validationErrors]);

  // Save in Local Storage
  const saveToLocalStorage = (name, item) => {
    localStorage.setItem(name, JSON.stringify(item));
  };

  // Data Validation
  const validate = () => {
    const validationErrors = [];
    let passed = true;
    if (!title) {
      validationErrors.push('Add Note Title');
      passed = false;
    }
    if (!content) {
      validationErrors.push('Add Note Content');
      passed = false;
    }
    setValidationErrors(validationErrors);
    return passed;
  };

  //Change Note Title
  const changeTitleHandler = (event) => {
    setTitle(event.target.value);
  };

  //Change Note Content
  const changeContentHandler = (event) => {
    setContent(event.target.value);
  };

  //Move to Add Note Mode
  const addNoteHandler = () => {
    setCreating(true);
    setTitle('');
    setContent('');
    setEditing(false);
  };

  //Select Note
  const selectNoteHandler = (noteId) => {
    setSelectedNote(noteId);
    setCreating(false);
    setEditing(false);
  };

  //Save Note
  const saveNoteHandler = () => {
    if (!validate()) return;
    const note = {
      id: new Date(),
      title: title,
      content: content,
    };
    const updatedNotes = [...notes, note];
    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setTitle('');
    setContent('');
    setCreating(false);
    setSelectedNote(note.id);
  };

  //Delete Note
  const deleteNoteHandler = (noteId) => {
    const updatedNotes = [...notes];
    const noteIndex = updatedNotes.findIndex((note) => note.id === noteId);
    updatedNotes.splice(noteIndex, 1);
    saveToLocalStorage('notes', updatedNotes);
    setNotes(updatedNotes);
    setSelectedNote(null);
  };

  // Move to Edit Note Mode
  const editNoteHandler = (noteId) => {
    const note = notes.find((note) => note.id === noteId);

    setEditing(true);
    setTitle(note.title);
    setContent(note.content);
  };

  // Save New Changes
  const updateNoteHandler = () => {
    if (!validate()) return;
    const updatedNotes = [...notes];
    const noteIndex = notes.findIndex((note) => note.id === selectedNote);
    updatedNotes[noteIndex] = {
      id: selectedNote,
      title: title,
      content: content,
    };
    saveToLocalStorage('notes', updatedNotes);

    setNotes(updatedNotes);
    setEditing(false);
    setTitle('');
    setContent('');
  };

  // Get Add Note Form
  const getAddNote = () => {
    return (
      <NoteForm
        formTitle="New Note"
        title={title}
        content={content}
        titleChanged={changeTitleHandler}
        contentChanged={changeContentHandler}
        submitText="Save"
        submitClicked={saveNoteHandler}
      />
    );
  };

  // Get Show Note Section
  const getPreview = () => {
    if (notes.length === 0) {
      return <Message title="No Notes Find" />;
    }

    if (!selectedNote) {
      return <Message title="Select Note" />;
    }

    const note = notes.find((note) => {
      return note.id === selectedNote;
    });

    let noteDisplay = (
      <div>
        <h2>{note.title}</h2>
        <p>{note.content}</p>
      </div>
    );

    if (editing) {
      noteDisplay = (
        <NoteForm
          formTitle="Edit Note"
          title={title}
          content={content}
          titleChanged={changeTitleHandler}
          contentChanged={changeContentHandler}
          submitText="Edit"
          submitClicked={updateNoteHandler}
        />
      );
    }

    return (
      <div>
        {!editing && (
          <div className="note-operations">
            <a href="#" onClick={() => editNoteHandler(note.id)}>
              <i className="fa fa-pencil-alt" />
            </a>
            <a href="#" onClick={() => deleteNoteHandler(note.id)}>
              <i className="fa fa-trash" />
            </a>
          </div>
        )}
        {noteDisplay}
      </div>
    );
  };

  return (
    <div className="App">
      <NotesContainer>
        <NotesList>
          {notes.map((note) => (
            <Note
              key={note.id}
              title={note.title}
              active={selectedNote === note.id}
              noteClicked={() => selectNoteHandler(note.id)}
            />
          ))}
        </NotesList>
        <button className="add-btn" onClick={addNoteHandler}>
          +
        </button>
      </NotesContainer>
      <Preview>{creating ? getAddNote() : getPreview()}</Preview>

      {validationErrors.length !== 0 && (
        <Alert validationMessages={validationErrors} />
      )}
    </div>
  );
}

export default App;
