
let prev_table = '';

async function tableClicked(e, key, parent_k) {
    let el = e.target

    if (el.classList.contains('active')) {

    } else {
        let prev = document.getElementById(prev_table)
        if (prev) {
            console.log(prev.innerText)
            prev.style.color = ''
            prev.style.borderColor = ''
            prev.classList.remove('active')
        }

        el.classList.add('active')
        el.style.color = 'blue'
        el.style.borderColor = 'blue'
        prev_table = 'table_' + parent_k + '_' + key
    }

    const d = await fetch(`/data?db=${el.parentNode.parentNode.innerText}&table=${el.innerText}`, {method: 'get'})
    const res = await d.json()
    renderTables(res)
}

function dbClicked(e, key) {
    let el = e.target

    if (el.classList.contains('active')) {
        el.classList.remove('text-green', 'active')
        document.getElementById(`tables_${key}`).classList.add('hidden')
    } else {
        el.classList.add('text-green', 'active')
        document.getElementById(`tables_${key}`).classList.remove('hidden')
    }
}

function renderTables(data) {

}
