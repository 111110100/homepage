const about = document.querySelector('#about')
const contact = document.querySelector('#contact')
const aboutContent = document.querySelector('#about-content')
const contactContent = document.querySelector('#contact-content')

const horizontalCenter = Math.floor((window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth)/2);
const verticalCenter = Math.floor((window.innerHeight|| document.documentElement.clientHeight.document.body.clientHeight)/2);

let aboutOpen = false
let contactOpen = false

about.addEventListener('click', () => {
  if (aboutOpen) {
    return
  }
  aboutOpen = true
  const aboutBox = new WinBox({
    title: 'About Me',
    // modal: true,
    x: "center",
    y: "center",
    width: '400px',
    height: '400px',
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    mount: aboutContent,
    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
    onclose: function() {
      aboutOpen = false
      return
    }
  })
})

contact.addEventListener('click', () => {
  if (contactOpen) {
    return
  }
  contactOpen = true
  const contactBox = new WinBox({
    title: 'Contact Me',
    x: horizontalCenter - 150,
    y: verticalCenter - 150,
    background: '#00aa00',
    width: '400px',
    height: '400px',
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
    mount: contactContent,
    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
    onclose: function() {
      contactOpen = false
      return
    }
  })
})
