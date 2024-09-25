
/**

This Module does the following;

1. get tables
. color the right db
2. create header
4. create main section
6. handle create table
7. handle edit db
8. hadle delete table

 **/

async function getTables(e, name, key) {
    let res = await fetch(`/data/tables?database=${name}`, {method: "get"})
    if (res.status == 200) {
        let tables = await dd.json()

    } else {
        return 0
    }
}
function colorSideBarDB(key) {
    ById('create_database_form').style.display = "none"

    let sidebar_dbs = document.getElementsByClassName('db_listed')
    for (let i = 0; i < sidebar_dbs.length; i++) {
        sidebar_dbs[i].style.backgroundColor = "white"
    }

    ById('db_' + key).style.backgroundColor = "#bbf7d0"
}

function createHeader(db_name) {
    let displayer = ById('display')
    displayer.innerHTML = ''

    let divs = createNode('div')
    divs.classList.add('flex', 'justify-between', 'items-center', 'py-6', 'border-b', 'border-slate-200', 'sticky', 'top-0', 'bg-gray-100')

    let header = createNode('h2')
    header.classList.add('text-2xl', 'font-bold')
    header.innerHTML = `TABLES in the <span class='text-blue-700'>${db_name}</span> Database`
    divs.append(header)

    let create_t_btn = createNode('button')
    create_t_btn.innerText = 'Create New Table'
    create_t_btn.type = 'button'
    create_t_btn.classList.add('p-3', 'rounded-lg', 'bg-green-200', 'border', 'border-slate-400', 'text-slate-700', 'uppercase')

    let rename_btn = createNode('button')
    rename_btn.innerText = 'Rename Database'
    rename_btn.type = 'button'
    rename_btn.classList.add('p-3', 'rounded-lg', 'bg-orange-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    rename_btn.addEventListener('click', async e => {
        renameDatabase(db_name)
    })

    let delete_db_btn = createNode('button')
    delete_db_btn.innerText = 'Delete Database'
    delete_db_btn.type = 'button'
    delete_db_btn.classList.add('p-3', 'rounded-lg', 'bg-rose-100', 'text-slate-700', 'uppercase', 'border', 'border-slate-300')
    delete_db_btn.addEventListener('click', async e => {
        e.preventDefault()
        deleteDatabase(db_name)
    })

    let h_btn_cont = createNode('div')
    h_btn_cont.classList.add('flex', 'gap-3', 'items-center')
    h_btn_cont.append(create_t_btn)
    h_btn_cont.append(rename_btn)
    h_btn_cont.append(delete_db_btn)
    divs.append(h_btn_cont)
    displayer.append(divs)

}

function createTables(data) {
    if (data.length < 1) {
        let error = createNode('p')
        let text = "The Database " + mydb + " Has No Tables"
        error.innerText = text
        error.classList.add('text-xl', 'my-4', 'text-orange-500')
        displayer.append(error)
    } else {
        let tables_cont = createNode('div')
        tables_cont.classList.add('flex', 'flex-col', 'gap-3', 'mt-6')

        for (let i = 0; i < data.length; i++) {
            let each_table = createNode("div")
            each_table.classList.add('flex', 'py-2', 'px-4', 'rounded-lg', 'bg-white', 'border', 'border-slate-200', 'gap-3', 'justify-between', 'items-center')

            let view_btn = createNode('button')
            view_btn.classList.add('bg-slate-400', 'rounded-lg', 'text-white')
            view_btn.innerText = 'View Table'

            let del_btn = createNode('button')
            del_btn.classList.add('bg-rose-200', 'rounded-lg', 'text-slate-600')
            del_btn.innerText = 'Delete Table'
            let btn_cont = createNode("div")
            btn_cont.classList.add('flex', 'gap-3', 'justify-between', 'items-center')
            btn_cont.append(view_btn)
            btn_cont.append(del_btn)


            view_btn.addEventListener('click', async () => {
                const d = await fetch(`/data?db=${mydb}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                const res = await d.json()
                renderRowsTable(res.data, res.columns, mydb, Object.values(data[i])[0], key, res.columns_full)
            })


            let da = new FormData()
            da.append('table', Object.values(data[i])[0])
            da.append('database', mydb)

            del_btn.addEventListener('click', async (e) => {
                let dt = await fetch('/delete/table', {
                    method: "POST", body: da,
                    headers: {
                        'X-CSRF-TOKEN': token
                    },
                })
                if (dt.status == 200) {
                    getTables(e, mydb, key)
                } else {
                    let gb = ById('global_error')
                    gb.style.display = 'flex'
                    gb.innerText = await dt.json()
                    setTimeout(() => {
                        gb.style.display = 'none'
                        gb.innerText = ''
                    }, 5000)
                }
            })

            for (let b in data[i]) {
                let td = createNode("p")
                td.classList.add('text-lg', 'font-bold', 'text-slate-700', 'cursor-pointer')
                td.innerText = data[i][b]

                td.addEventListener('click', async () => {
                    const d = await fetch(`/data?db=${mydb}&table=${Object.values(data[i])[0]}`, {method: 'get'})
                    const res = await d.json()
                    renderRowsTable(res.data, res.columns, mydb, Object.values(data[i])[0], key, res.columns_full)
                })

                each_table.append(td)
            }

            each_table.append(btn_cont)
            tables_cont.append(each_table)
        }
        displayer.append(tables_cont)
    }
}


create_t_btn.addEventListener('click', e => {
    ById('create_table_modal').style.display = 'flex'
    ById('create_table_db').value = mydb
    ById('create_table_title').innerText = 'Create a new table in the ' + mydb + " database"

    ById('create_table_modal').addEventListener('submit', async e => {
        e.preventDefault()
        let dd = new FormData(e.target)
        let r = await fetch('/create/table', {method: "POST", headers: {'X-CSRF-TOKEN': token}, body: dd})
        if (r.status == 200) {
            ById('create_table_modal').style.display = 'none'
            ById('create_table_error').style.display = 'none'
            // call create table row
            getTables(e, e.target.db.value, key)
        } else {
            ById('create_table_error').style.display = 'flex'
            ById('create_table_error').innerText = await r.json()
        }
    })
})





