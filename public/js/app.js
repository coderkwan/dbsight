/**
This Module define global vars and functions
 **/

function ById(id) {
    return document.getElementById(id)
}

function createNode(tag) {
    return document.createElement(tag)
}

let token = document.querySelector('input[name="_token"]').getAttribute('value')

