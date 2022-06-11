const {nanoid} = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    // eslint-disable-next-line max-len
    // Client tidak menuliskan properti name pada request body sehingga gagal menambah buku
    const response = h
        .response({
          status: 'fail',
          message: 'Gagal menambahkan buku. Mohon isi nama buku',
        })
        .code(400);
    return response;
  }

  if (readPage > pageCount) {
    // eslint-disable-next-line max-len
    // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount sehingga gagal menambahkan buku kedalam server
    const response = h
        .response({
          status: 'fail',
          message:
          // eslint-disable-next-line max-len
          'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    id,
    finished,
    insertedAt,
    updatedAt,
  };

  books.push(newBook); // push to books array

  // eslint-disable-next-line max-len
  const isSuccess = books.filter((note) => note.id === id).length > 0;

  if (isSuccess) {
    // Buku berhasil ditambah kedalam server
    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        })
        .code(201);
    return response;
  }

  // Generic Eror karena server sehingga buku gagal ditambah kedalam server
  const response = h
      .response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
      })
      .code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const {name, reading, finished} = request.query;

  if (!name && !reading && !finished) {
    // Tidak terdapat query
    const response = h
        .response({
          status: 'success',
          data: {
            books: books.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            })),
          },
        })
        .code(200);

    return response;
  }

  if (name) {
    const filteredBooksName = books.filter((book) => {
      // Terdapat query name
      const nameRegex = new RegExp(name, 'gi');
      return nameRegex.test(book.name);
    });

    const response = h
        .response({
          status: 'success',
          data: {
            books: filteredBooksName.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            })),
          },
        })
        .code(200);

    return response;
  }

  if (reading) {
    // Terdapat query reading
    const filteredBooksReading = books.filter(
        (book) => Number(book.reading) === Number(reading),
    );

    const response = h
        .response({
          status: 'success',
          data: {
            books: filteredBooksReading.map((book) => ({
              id: book.id,
              name: book.name,
              publisher: book.publisher,
            })),
          },
        })
        .code(200);

    return response;
  }

  // Terdapat query finished
  const filteredBooksFinished = books.filter(
      (book) => Number(book.finished) === Number(finished),
  );

  const response = h
      .response({
        status: 'success',
        data: {
          books: filteredBooksFinished.map((book) => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
          })),
        },
      })
      .code(200);

  return response;
};

const getBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  const book = books.filter((n) => n.id === bookId)[0];

  if (book) {
    // ID yang ditulis ditemukan oleh server
    const response = h
        .response({
          status: 'success',
          data: {
            book,
          },
        })
        .code(200);
    return response;
  }

  // Id yang ditulis oleh client tidak ditemukan oleh server
  const response = h
      .response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      })
      .code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name) {
    // eslint-disable-next-line max-len
    // Client tidak menuliskan properti name pada request body sehingga gagal memperbarui buku dalam server
    const response = h
        .response({
          status: 'fail',
          message: 'Gagal memperbarui buku. Mohon isi nama buku',
        })
        .code(400);
    return response;
  }

  if (readPage > pageCount) {
    // eslint-disable-next-line max-len
    // Client menuliskan nilai properti readPage yang lebih besar dari nilai properti pageCount sehingga gagal memperbarui buku pada server
    const response = h
        .response({
          status: 'fail',
          message:
          // eslint-disable-next-line max-len
          'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        })
        .code(400);
    return response;
  }

  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  // eslint-disable-next-line max-len
  const index = books.findIndex((note) => note.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };

    // eslint-disable-next-line max-len
    // ID yang ditulis sesuai dengan yang ada dalam server sehingga buku berhasil diperbarui
    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        })
        .code(200);
    return response;
  }

  // eslint-disable-next-line max-len
  // id yang ditulis tidak sesuai dengan yang ada dalam server sehingga tidak bisa diperbarui
  const response = h
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      .code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const {bookId} = request.params;

  // eslint-disable-next-line max-len
  const index = books.findIndex((note) => note.id === bookId); // find book by id

  if (index !== -1) {
    books.splice(index, 1);

    // eslint-disable-next-line max-len
    // Id yang ditulis sesuai dengan yang ada dalam server sehingga berhasil dihapus
    const response = h
        .response({
          status: 'success',
          message: 'Buku berhasil dihapus',
        })
        .code(200);
    return response;
  }

  // ID yang ditulis tidak berada ada dalam server sehingga gagal hapus
  const response = h
      .response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      })
      .code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
