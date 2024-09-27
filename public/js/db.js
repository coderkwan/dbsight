
/**

This Module does the following;
1. get dbs
2. create side bar
4. create main section
6. handle create db
7. handle rename db
8. hadle delete db

 **/

async function getDbsApi() {
    let d = await fetch('/home', {method: 'get'})
    if (d.status == 200) {
        const dbs = await d.json()
        createSideBarDBs(dbs)
        createMainSectionDBs(dbs)
    } else {
        return 0
    }
}


function createSideBarDBs(dbs) {
    let sb = ById('sidebar')
    sb.innerHTML = ''

    dbs.forEach((item, i) => {
        let sb_container = createNode('div')
        sb_container.classList.add('side_container')

        let sb_wrap = createNode('div')
        sb_wrap.classList.add('side_wrapper')

        let sb_drop = createNode('div')
        sb_drop.innerText = '+'
        sb_drop.classList.add('border', 'border-slate-400', 'rounded-lg', 'cursor-pointer', 'bg-white', 'px-3', 'py-2')
        sb_drop.addEventListener('click', (e) => {
            sidebarDropDownClicked(e, i, item['Database'])
        })

        let sb_p = createNode('p')
        sb_p.id = "db_" + i
        sb_p.innerText = item['Database']
        sb_p.addEventListener('click', (e) => getTables(e, item['Database'], i))
        sb_p.classList.add('db_listed', 'border', 'border-slate-400', 'rounded-lg', 'py-2', 'ps-4', 'w-full', 'bg-white', 'cursor-pointer')

        let sb_kids = createNode('div')
        sb_kids.classList.add('table_listed')
        sb_kids.id = 'tables_' + i

        sb_wrap.append(sb_drop)
        sb_wrap.append(sb_p)
        sb_container.append(sb_wrap)
        sb_container.append(sb_kids)
        sb.append(sb_container)

    })
}

function createMainSectionDBs(dbs) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    ById('raw_sql').style.display = 'none'

    ById('create_database_form').style.display = "flex"

    let container = createNode('div')
    container.classList.add('flex', 'flex-wrap', 'gap-3')

    let hh = createNode('h3')
    hh.innerText = 'Databases'
    hh.classList.add('uppercase', 'font-bold', 'text-2xl', 'mb-3', 'text-slate-700')
    displayer.append(hh)

    dbs.forEach((item, i) => {
        let element = createNode('div')
        element.classList.add('p-7', 'bg-white', 'border', 'border-slate-300', 'rounded-lg', 'min-w-[300px]', 'cursor-pointer')

        let pb = createNode('h4')
        pb.innerText = item['Database']
        pb.classList.add('font-bold')
        element.append(pb)

        let pa = createNode('p')
        pa.innerText = "Tables: " + item['table_count']
        pa.classList.add('text-xs', 'uppercase', 'text-blue-600')
        element.append(pa)

        element.addEventListener('click', (e) => getTables(e, item['Database'], i))

        container.append(element)
    })
    displayer.append(container)
}

async function sidebarDropDownClicked(e, key, db_name) {
    let clicked_icon = e.target

    if (clicked_icon.classList.contains('active')) {
        clicked_icon.classList.remove('active')
        clicked_icon.innerText = "+"
        ById(`tables_${key}`).style.display = 'none'
    } else {
        clicked_icon.classList.add('active')
        clicked_icon.innerText = "-"
        ById(`tables_${key}`).style.display = 'flex'

        let table_container = ById(`tables_${key}`)
        table_container.innerHTML = ''

        let res = await fetch(`/data/tables?database=${db_name}`, {method: "get"})
        let data = await res.json()

        for (let i = 0; i < data.length; i++) {
            let table_name = data[i][`Tables_in_${db_name}`]

            let table_div = createNode('div')
            table_div.id = key + "_" + i
            table_div.innerText = table_name
            table_div.classList.add('ms-2', 'cursor-pointer', 'mt-1', 'p-2', 'border', 'border-slate-300', 'rounded-md', 'bg-slate-200', 'text-slate-800')
            table_div.addEventListener('click', () => getRows(db_name, table_name, key))

            table_container.append(table_div)
        }
    }
}


async function deleteDatabase(database) {
    let data = new FormData()
    data.append('database', database)

    let res = await fetch('/delete/database', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: data})
    if (res.status == 200) {
        window.location.href = "/"
    } else {
        let body = await res.json();
        let global_error = ById('global_error')
        global_error.style.display = 'flex'
        global_error.innerText = body
        setTimeout(() => {
            global_error.style.display = 'none'
            global_error.innerText = ''
        }, 5000)
    }
}

function renameDatabase(database) {
    ById('rename_databese').style.display = 'flex'
    let form = ById('rename_databese_form')
    form.elements['name'].value = database
    form.elements['old_name'].value = database

    form.addEventListener('submit', async e => {
        e.preventDefault()
        let data = new FormData(form)
        let res = await fetch('database/rename', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: data})

        if (res.status != 200) {
            let body = await res.json();
            let global_error = ById('rename_error')
            global_error.style.display = 'flex'
            global_error.innerText = body
            setTimeout(() => {
                global_error.style.display = 'none'
                global_error.innerText = ''
            }, 5000)
        } else {
            window.location.href = '/'
        }
    })

    ById('close_rename_modal').addEventListener('click', (e) => {
        ById('rename_databese').style.display = 'none'
    })
}


function deleteModal(database) {
    const wrapper = createNode('div')
    const modal = createNode('div')
    const modal_cancel = createNode('button')
    const modal_submit = createNode('button')
    const modal_text = createNode('p')
    const text = `Are you sure you want to delete the database <span class='font-bold text-indigo-500'>${database}</span>?`

    wrapper.classList.add('w-screen', 'h-screen', 'absolute', 'top-0', 'right-0', 'left-0', 'mx-auto', 'bg-[rgba(105,105,105,0.53)]')
    modal.classList.add('bg-white', 'border', 'rounded-2xl', 'border-slate-300', 'p-4', 'absolute', 'top-5', 'max-w-[700px]', 'mx-auto', 'left-0', 'right-0', 'text-center')

    modal_cancel.type = 'button'
    modal_submit.type = 'button'
    modal_cancel.innerText = 'Cancel'
    modal_submit.innerText = 'Delete Database'
    modal_cancel.classList.add('bg-red-400', 'text-slate-100', 'rounded-lg', 'py-2', 'px-5', 'me-2', 'font-bold')
    modal_submit.classList.add('bg-green-100', 'border', 'border-slate-400', 'text-slate-600', 'rounded-lg', 'py-2', 'px-5', 'me-2', 'font-bold')
    modal_text.classList.add('text-lg', 'my-5')

    modal_text.innerHTML = text

    modal.append(modal_text)
    modal.append(modal_cancel)
    modal.append(modal_submit)
    wrapper.append(modal)
    ById('display').append(wrapper)

    modal_cancel.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
    })

    modal_submit.addEventListener('click', (e) => {
        wrapper.style.display = 'none'
        deleteDatabase(database)
    })
}


