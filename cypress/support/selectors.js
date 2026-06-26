export const selectors = {
  auth: {
    username: '#username',
    password: '#password',
    rememberMe: '#remember_me, input[name="remember_me"]',
    submit: 'button[name="submit"], button[type="submit"]',
    alert: '.alert, [role="alert"]',
    userMenu: '.navbar, body',
    forgotPassword: 'a, button',
    recoveryInput: '#email, #username',
  },
  catalog: {
    searchBox: '#searchbox, input[name="query"]',
    bookLink: 'a[href^="/book/"], a[href*="/book/"]',
  },
  bookDetails: {
    modal: '.modal:visible .modal-content',
    title: '.modal-title, h2',
    bookName: '#title, h2',
    cover: 'img[src*="/cover/"], .cover img',
    addToShelfButton: '#add-to-shelf, button[aria-label="Add to shelves"]',
    addShelfMenuItem: '#add-to-shelves [data-shelf-action="add"]',
    removeShelfButton: '#remove-from-shelves [data-shelf-action="remove"]',
  },
  shelf: {
    createLink: 'a[href="/shelf/create"], a[href*="/shelf/create"]',
    titleInput: '#title, input[name="title"]',
    saveButton: '#submit, button[type="submit"]',
    heading: 'h1, h2',
    deleteButton: '#delete_shelf',
    confirmDeleteButton: '#btnConfirmYes-GeneralDeleteModal',
  },
  navigation: {
    item: 'a, button',
    hotBooks: 'a[href*="/hot"], a',
  },
  page: {
    body: 'body',
  },
}
