import { initializeApp   } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js"
import { getFirestore, collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged  } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js"

const formAddPhrase = document.querySelector('[data-modal="add-phrase"]')

const firebaseConfig = {
    apiKey: "AIzaSyA_xOndhy7rmN8xlAjmHVcDGAN5AktQ97U",
    authDomain: "jeidencw-auth.firebaseapp.com",
    projectId: "jeidencw-auth",
    storageBucket: "jeidencw-auth.appspot.com",
    messagingSenderId: "407413216804",
    appId: "1:407413216804:web:99cd7c38b12d5e61b5eab1",
    measurementId: "G-H2T01WFFEE"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const provider = new GoogleAuthProvider()
const auth = getAuth()
const collectionPhrases = collection(db, 'phrases')

const closeModal = modalName => M.Modal.getInstance(modalName).close()

const addPhrase = async e => {
    e.preventDefault()

    try {
        const docRef = await addDoc(collectionPhrases, {
            movieTitle: DOMPurify.sanitize(e.target.title.value),
            phrase: DOMPurify.sanitize(e.target.phrase.value)
        })
        closeModal(formAddPhrase)
        console.log('Adiconado com o id: ', docRef.id)
        
    } catch (error) {
        console.log('Erro ao adicionar documento: ', error);
    }
}


const handleAuthStateChanged = user => {
    const ulList = [...document.querySelector('[data-js="nav-ul"]').children]
    const loginMessageExist = document.querySelector('[data-js="login-message"]')
    const ulPhrasesList = document.querySelector('[data-js="phrases-list"]')   
    const loginWithGoogleButton = document.querySelector('[data-js="button-form"]')
    const logOutButton = document.querySelector('[data-js="logout"]')
    const accountDetailsContainer = document.querySelector('[data-js="account-details"]')

    const accountDetails = document.createElement('p')

    loginMessageExist?.remove()    

    ulList.forEach(li =>{
        const liToBeVisible = li.dataset.js.includes(user ? 'logged-in' : 'logged-out')

        if(liToBeVisible){
            li.classList.remove('hide')
            return
        }

        li.classList.add('hide')
    })

    if(!user){
        const phraseContainer = document.querySelector('[data-js="phrases-container"]')    
        const loginMessage = document.createElement('h5')

        loginMessage.textContent = 'Faça login para ver as frases'
        loginMessage.classList.add('center-align', 'white-text')
        loginMessage.setAttribute('data-js', 'login-message')
        phraseContainer.append(loginMessage)

        formAddPhrase.removeEventListener('submit', addPhrase)
        loginWithGoogleButton.addEventListener('click', login)
        logOutButton.onclick = null

        accountDetailsContainer.innerHTML = ''
        ulPhrasesList.innerHTML = ''
        return
    }
    
    const unsubscribe = onSnapshot(collectionPhrases, snapshot => {
        const documentFragment = document.createDocumentFragment()

        snapshot.docChanges().forEach(docChange => {
            const liMovie = document.createElement('li')
            const titleDiv = document.createElement('div')
            const phraseDiv = document.createElement('div')
            const { movieTitle, phrase } = docChange.doc.data()

            
            titleDiv.textContent = DOMPurify.sanitize(movieTitle)
            titleDiv.setAttribute('class', 'collapsible-header blue-grey-text text-lighten-5 blue-grey darken-4')
            phraseDiv.textContent = DOMPurify.sanitize(phrase)
            phraseDiv.setAttribute('class', 'collapsible-body blue-grey-text text-lighten-5 blue-grey darken-3')

            liMovie.append(titleDiv, phraseDiv)
            documentFragment.append(liMovie)
        })

        M.Collapsible.init(ulPhrasesList)
        ulPhrasesList.append(documentFragment)
    })

    accountDetails.textContent = DOMPurify.sanitize(`${user.displayName} | ${user.email}`)
    accountDetailsContainer.append(accountDetails)

    loginWithGoogleButton.removeEventListener('click', login)
    logOutButton.onclick = () => logOut(unsubscribe)
    formAddPhrase.addEventListener('submit', addPhrase)
}

const login = async () => {
    try {
        const modalLogin = document.querySelector('[data-js="modal-login"]')
        await signInWithPopup(auth, provider)
        closeModal(modalLogin)
    } catch (error) {
        console.log('Erro no login: ', error)
    }
}

const logOut = async unsubscribe => {
    try {
        await signOut(auth)
        unsubscribe()
        console.log('Deslogado')
    } catch (error) {
        console.log('Erro ao deslogar: ', error)
    }
}

const initModals = () => {
    const modals = document.querySelectorAll('.modal')
    M.Modal.init(modals)
}

onAuthStateChanged(auth, handleAuthStateChanged)

initModals()