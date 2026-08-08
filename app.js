// ======================================================
// 💰 MI PRESUPUESTO
// app.js
// ======================================================


// ======================================================
// DATOS
// ======================================================

let categorias = [];
let gastos = [];
let historialMeses = [];

let categoriaEditando = null;
let gastoEditando = null;


// Claves utilizadas para guardar los datos
const CLAVE_DATOS = "miPresupuestoDatos";
const CLAVE_HISTORIAL = "miPresupuestoHistorial";


// ======================================================
// FUNCIONES GENERALES
// ======================================================

function dinero(numero) {

    return "$" + Number(numero || 0).toLocaleString("es-AR");

}


function fechaHoy() {

    const fecha = new Date();

    const año = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${año}-${mes}-${dia}`;

}


function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


// ======================================================
// NAVEGACIÓN
// ======================================================

document.querySelectorAll(".nav-btn").forEach(
    function (boton) {

        boton.addEventListener(
            "click",
            function () {

                const seccion =
                    boton.dataset.seccion;


                // Sacar activo de todos
                document
                    .querySelectorAll(".nav-btn")
                    .forEach(
                        function (btn) {

                            btn.classList.remove("activo");

                        }
                    );


                // Activar botón
                boton.classList.add("activo");


                // Ocultar secciones
                document
                    .querySelectorAll(".seccion")
                    .forEach(
                        function (seccion) {

                            seccion.classList.remove("activa");

                        }
                    );


                // Mostrar sección elegida
                const elemento =
                    document.getElementById(seccion);


                if (elemento) {

                    elemento.classList.add("activa");

                }

            }
        );

    }
);


// ======================================================
// GUARDAR DATOS
// ======================================================

function guardarDatos() {

    const datos = {

        ingreso:
            document.getElementById("ingreso").value,

        gastosFijos:
            document.getElementById("gastosFijos").value,

        porcentajeAhorro:
            document.getElementById("porcentajeAhorro").value,

        porcentajeComida:
            document.getElementById("porcentajeComida").value,

        montoVehiculo:
            document.getElementById("montoVehiculo").value,

        montoExtra:
            document.getElementById("montoExtra").value,

        categorias:
            categorias,

        gastos:
            gastos

    };


    localStorage.setItem(
        CLAVE_DATOS,
        JSON.stringify(datos)
    );

}


// ======================================================
// CARGAR DATOS
// ======================================================

function cargarDatos() {

    const guardado =
        localStorage.getItem(CLAVE_DATOS);


    if (!guardado) {

        mostrarCategorias();

        mostrarGastos();

        actualizarInicio();

        return;

    }


    try {

        const datos =
            JSON.parse(guardado);


        document.getElementById("ingreso").value =
            datos.ingreso || "";


        document.getElementById("gastosFijos").value =
            datos.gastosFijos || "";


        document.getElementById("porcentajeAhorro").value =
            datos.porcentajeAhorro ?? 20;


        document.getElementById("porcentajeComida").value =
            datos.porcentajeComida ?? 15;


        document.getElementById("montoVehiculo").value =
            datos.montoVehiculo ?? 0;


        document.getElementById("montoExtra").value =
            datos.montoExtra ?? 0;


        categorias =
            Array.isArray(datos.categorias)
                ? datos.categorias
                : [];


        gastos =
            Array.isArray(datos.gastos)
                ? datos.gastos
                : [];

    }

    catch (error) {

        console.error(
            "Error cargando datos:",
            error
        );

        categorias = [];
        gastos = [];

    }


    mostrarCategorias();

    actualizarSelectCategorias();

    mostrarGastos();

    actualizarInicio();


    const ingreso =
        Number(
            document.getElementById("ingreso").value
        );


    if (ingreso > 0) {

        calcular();

    }

}


// ======================================================
// CALCULAR PRESUPUESTO
// ======================================================

function calcular() {

    const ingreso =
        Number(
            document.getElementById("ingreso").value
        );


    const gastosFijos =
        Number(
            document.getElementById("gastosFijos").value
        );


    if (ingreso <= 0) {

        alert(
            "Ingresá un ingreso mensual válido."
        );

        return;

    }


    if (gastosFijos < 0) {

        alert(
            "Los gastos fijos no pueden ser negativos."
        );

        return;

    }


    const porcentajeAhorro =
        Number(
            document.getElementById(
                "porcentajeAhorro"
            ).value
        );


    const porcentajeComida =
        Number(
            document.getElementById(
                "porcentajeComida"
            ).value
        );


    const montoVehiculo =
        Number(
            document.getElementById(
                "montoVehiculo"
            ).value
        );


    const montoExtra =
        Number(
            document.getElementById(
                "montoExtra"
            ).value
        );


    if (
        porcentajeAhorro < 0 ||
        porcentajeAhorro > 100
    ) {

        alert(
            "El porcentaje de ahorro debe estar entre 0 y 100."
        );

        return;

    }


    if (
        porcentajeComida < 0 ||
        porcentajeComida > 100
    ) {

        alert(
            "El porcentaje de comida debe estar entre 0 y 100."
        );

        return;

    }


    // ==================================================
    // DINERO DISPONIBLE
    // ==================================================

    const disponibleInicial =
        ingreso -
        gastosFijos;


    // ==================================================
    // CATEGORÍAS PERSONALIZADAS
    // ==================================================

    const totalCategorias =
        categorias.reduce(
            function (total, categoria) {

                return total +
                    Number(categoria.monto || 0);

            },
            0
        );


    // ==================================================
    // RESTAR VEHÍCULO, EXTRA Y CATEGORÍAS
    // ==================================================

    const dineroParaPorcentajes =
        disponibleInicial -
        montoVehiculo -
        montoExtra -
        totalCategorias;


    // ==================================================
    // AHORRO
    // ==================================================

    const ahorro =
        Math.max(
            dineroParaPorcentajes,
            0
        ) *
        porcentajeAhorro /
        100;


    // ==================================================
    // COMIDA
    // ==================================================

    const dineroDespuesAhorro =
        dineroParaPorcentajes -
        ahorro;


    const comida =
        Math.max(
            dineroDespuesAhorro,
            0
        ) *
        porcentajeComida /
        100;


    // ==================================================
    // GASTOS REALIZADOS
    // ==================================================

    const totalGastado =
        calcularTotalGastos();


    // ==================================================
    // DINERO RESTANTE
    // ==================================================

    const dineroRestante =
        disponibleInicial -
        ahorro -
        comida -
        montoVehiculo -
        montoExtra -
        totalCategorias -
        totalGastado;


    // ==================================================
    // ALERTA
    // ==================================================

    let alerta = "";


    if (dineroRestante < 0) {

        alerta = `

            <div class="alerta">

                ⚠️ Atención: estás gastando
                más dinero del disponible.

            </div>

        `;

    }


    // ==================================================
    // RESULTADO
    // ==================================================

    let categoriasHTML = "";


    categorias.forEach(
        function (categoria) {

            categoriasHTML += `

                <div class="categoria">

                    <span>
                        📌 ${escaparHTML(
                            categoria.nombre
                        )}
                    </span>

                    <strong>
                        ${dinero(categoria.monto)}
                    </strong>

                </div>

            `;

        }
    );


    document.getElementById(
        "resultado"
    ).innerHTML = `

        <h2>
            📊 Tu presupuesto
        </h2>


        <p>
            💰 Ingreso:

            <strong>
                ${dinero(ingreso)}
            </strong>
        </p>


        <p>
            📋 Gastos fijos:

            <strong>
                ${dinero(gastosFijos)}
            </strong>
        </p>


        <p class="total">
            💵 Disponible:

            ${dinero(disponibleInicial)}
        </p>


        <hr>


        <div class="categoria">

            <span>
                🏦 Ahorro
                (${porcentajeAhorro}%)
            </span>

            <strong>
                ${dinero(ahorro)}
            </strong>

        </div>


        <div class="categoria">

            <span>
                🍔 Comida
                (${porcentajeComida}%)
            </span>

            <strong>
                ${dinero(comida)}
            </strong>

        </div>


        <div class="categoria">

            <span>
                🚗 Vehículo
            </span>

            <strong>
                ${dinero(montoVehiculo)}
            </strong>

        </div>


        <div class="categoria">

            <span>
                🎯 Extra
            </span>

            <strong>
                ${dinero(montoExtra)}
            </strong>

        </div>


        ${
            categoriasHTML
        }


        <hr>


        <div class="categoria">

            <span>
                💳 Gastos realizados
            </span>

            <strong>
                ${dinero(totalGastado)}
            </strong>

        </div>


        <!-- DESGLOSE DE GASTOS -->

        <div
            style="
                padding: 5px 0 10px 15px;
                color: #777;
                font-size: 14px;
            "
        >

            ${generarResumenGastosPorCategoria()}

        </div>


        <p class="total">

            💵 Dinero restante:

            ${dinero(dineroRestante)}

        </p>


        ${alerta}

    `;


    // ==================================================
    // GUARDAR
    // ==================================================

    guardarDatos();

    actualizarInicio();

    mostrarGastos();


    // Ocultar distribución
    ocultarDistribucion();

}


// ======================================================
// DESGLOSE DE GASTOS POR CATEGORÍA
// ======================================================

function generarResumenGastosPorCategoria() {

    if (gastos.length === 0) {

        return `

            <div>
                Todavía no registraste gastos.
            </div>

        `;

    }


    const totales = {};


    gastos.forEach(
        function (gasto) {

            const categoria =
                nombreCategoria(
                    gasto.categoria
                );


            if (!totales[categoria]) {

                totales[categoria] = 0;

            }


            totales[categoria] +=
                Number(gasto.monto || 0);

        }
    );


    let html = "";


    Object.entries(totales).forEach(
        function ([categoria, total]) {

            html += `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding:4px 0;
                    "
                >

                    <span>
                        ${categoria}
                    </span>

                    <strong>
                        ${dinero(total)}
                    </strong>

                </div>

            `;

        }
    );


    return html;

}


// ======================================================
// DISTRIBUCIÓN
// ======================================================

function ocultarDistribucion() {

    const distribucion =
        document.getElementById(
            "distribucion"
        );


    const botonEditar =
        document.getElementById(
            "botonEditarDistribucion"
        );


    if (distribucion) {

        distribucion.style.display =
            "none";

    }


    if (botonEditar) {

        botonEditar.style.display =
            "block";

    }

}


function mostrarDistribucion() {

    const distribucion =
        document.getElementById(
            "distribucion"
        );


    const botonEditar =
        document.getElementById(
            "botonEditarDistribucion"
        );


    if (distribucion) {

        distribucion.style.display =
            "block";

    }


    if (botonEditar) {

        botonEditar.style.display =
            "none";

    }

}


// ======================================================
// CATEGORÍAS
// ======================================================

function abrirModalCategoria(indice = null) {

    categoriaEditando =
        indice;


    const titulo =
        document.getElementById(
            "tituloModalCategoria"
        );


    const nombre =
        document.getElementById(
            "nombreCategoria"
        );


    const monto =
        document.getElementById(
            "montoCategoria"
        );


    if (indice === null) {

        titulo.innerText =
            "➕ Nueva categoría";

        nombre.value = "";

        monto.value = "";

    }

    else {

        titulo.innerText =
            "✏️ Editar categoría";

        nombre.value =
            categorias[indice].nombre;

        monto.value =
            categorias[indice].monto;

    }


    document.getElementById(
        "modalCategoria"
    ).style.display =
        "flex";

}


function cerrarModalCategoria() {

    document.getElementById(
        "modalCategoria"
    ).style.display =
        "none";


    categoriaEditando =
        null;

}


function guardarCategoria() {

    const nombre =
        document.getElementById(
            "nombreCategoria"
        ).value.trim();


    const monto =
        Number(
            document.getElementById(
                "montoCategoria"
            ).value
        );


    if (!nombre) {

        alert(
            "Tenés que escribir un nombre."
        );

        return;

    }


    if (
        isNaN(monto) ||
        monto < 0
    ) {

        alert(
            "Ingresá un monto válido."
        );

        return;

    }


    if (categoriaEditando === null) {

        categorias.push({

            id:
                Date.now(),

            nombre:
                nombre,

            monto:
                monto

        });

    }

    else {

        categorias[categoriaEditando].nombre =
            nombre;

        categorias[categoriaEditando].monto =
            monto;

    }


    guardarDatos();

    mostrarCategorias();

    actualizarSelectCategorias();

    cerrarModalCategoria();

    calcularSiCorresponde();

}


function mostrarCategorias() {

    const contenedor =
        document.getElementById(
            "categorias"
        );


    if (categorias.length === 0) {

        contenedor.innerHTML = `

            <p>
                Todavía no agregaste categorías.
            </p>

        `;

        actualizarSelectCategorias();

        return;

    }


    contenedor.innerHTML = "";


    categorias.forEach(
        function (categoria, indice) {

            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "categoria";


            elemento.innerHTML = `

                <span>
                    📌 ${escaparHTML(
                        categoria.nombre
                    )}
                </span>


                <strong>
                    ${dinero(categoria.monto)}
                </strong>


                <button
                    type="button"
                    onclick="
                        abrirModalCategoria(${indice})
                    "
                >
                    ✏️
                </button>


                <button
                    type="button"
                    onclick="
                        eliminarCategoria(${indice})
                    "
                >
                    🗑️
                </button>

            `;


            contenedor.appendChild(
                elemento
            );

        }
    );


    actualizarSelectCategorias();

}


function eliminarCategoria(indice) {

    const categoria =
        categorias[indice];


    if (!categoria) {

        return;

    }


    const confirmar =
        confirm(
            `¿Querés eliminar "${categoria.nombre}"?`
        );


    if (!confirmar) {

        return;

    }


    categorias.splice(
        indice,
        1
    );


    guardarDatos();

    mostrarCategorias();

    actualizarSelectCategorias();

    calcularSiCorresponde();

}


// ======================================================
// SELECT DE CATEGORÍAS
// ======================================================

function actualizarSelectCategorias() {

    const select =
        document.getElementById(
            "categoriaGasto"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="comida">
            🍔 Comida
        </option>

        <option value="vehiculo">
            🚗 Vehículo
        </option>

        <option value="extra">
            🎯 Extra
        </option>

        <option value="ahorro">
            🏦 Ahorro
        </option>

    `;


    categorias.forEach(
        function (categoria) {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                "personalizada_" +
                categoria.id;


            opcion.textContent =
                "📌 " +
                categoria.nombre;


            select.appendChild(
                opcion
            );

        }
    );

}


// ======================================================
// GASTOS
// ======================================================

function abrirModalGasto(indice = null) {

    gastoEditando =
        indice;


    actualizarSelectCategorias();


    if (indice === null) {

        document.getElementById(
            "tituloModalGasto"
        ).innerText =
            "💳 Nuevo gasto";


        document.getElementById(
            "nombreGasto"
        ).value = "";


        document.getElementById(
            "montoGasto"
        ).value = "";


        document.getElementById(
            "categoriaGasto"
        ).value =
            "comida";


        document.getElementById(
            "fechaGasto"
        ).value =
            fechaHoy();

    }

    else {

        const gasto =
            gastos[indice];


        document.getElementById(
            "tituloModalGasto"
        ).innerText =
            "✏️ Editar gasto";


        document.getElementById(
            "nombreGasto"
        ).value =
            gasto.nombre;


        document.getElementById(
            "montoGasto"
        ).value =
            gasto.monto;


        document.getElementById(
            "categoriaGasto"
        ).value =
            gasto.categoria;


        document.getElementById(
            "fechaGasto"
        ).value =
            gasto.fecha;

    }


    document.getElementById(
        "modalGasto"
    ).style.display =
        "flex";

}


function cerrarModalGasto() {

    document.getElementById(
        "modalGasto"
    ).style.display =
        "none";


    gastoEditando =
        null;

}


function guardarGasto() {

    const nombre =
        document.getElementById(
            "nombreGasto"
        ).value.trim();


    const monto =
        Number(
            document.getElementById(
                "montoGasto"
            ).value
        );


    const categoria =
        document.getElementById(
            "categoriaGasto"
        ).value;


    const fecha =
        document.getElementById(
            "fechaGasto"
        ).value;


    if (!nombre) {

        alert(
            "Ingresá el nombre del gasto."
        );

        return;

    }


    if (
        isNaN(monto) ||
        monto <= 0
    ) {

        alert(
            "Ingresá un monto válido."
        );

        return;

    }


    if (!fecha) {

        alert(
            "Seleccioná una fecha."
        );

        return;

    }


    const gasto = {

        id:
            gastoEditando === null
                ? Date.now()
                : gastos[gastoEditando].id,

        nombre:
            nombre,

        monto:
            monto,

        categoria:
            categoria,

        fecha:
            fecha

    };


    if (gastoEditando === null) {

        gastos.push(gasto);

    }

    else {

        gastos[gastoEditando] =
            gasto;

    }


    guardarDatos();

    mostrarGastos();

    cerrarModalGasto();

    actualizarInicio();

    calcularSiCorresponde();

}


// ======================================================
// MOSTRAR GASTOS
// ======================================================

function mostrarGastos() {

    const contenedor =
        document.getElementById(
            "listaGastos"
        );


    if (!contenedor) {

        return;

    }


    if (gastos.length === 0) {

        contenedor.innerHTML = `

            <p>
                Todavía no registraste ningún gasto.
            </p>

        `;

        actualizarResumenGastos();

        return;

    }


    // Mostrar primero los más recientes
    const gastosOrdenados =
        [...gastos].sort(
            function (a, b) {

                return b.fecha.localeCompare(
                    a.fecha
                );

            }
        );


    contenedor.innerHTML = "";


    gastosOrdenados.forEach(
        function (gasto) {

            const indiceOriginal =
                gastos.findIndex(
                    function (item) {

                        return item.id === gasto.id;

                    }
                );


            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "gasto-item";


            elemento.innerHTML = `

                <div class="gasto-arriba">

                    <span class="gasto-nombre">

                        ${escaparHTML(
                            gasto.nombre
                        )}

                    </span>


                    <span class="gasto-monto">

                        ${dinero(
                            gasto.monto
                        )}

                    </span>

                </div>


                <div class="gasto-info">

                    ${nombreCategoria(
                        gasto.categoria
                    )}

                    ·

                    ${formatearFecha(
                        gasto.fecha
                    )}

                </div>


                <div class="gasto-botones">

                    <button
                        type="button"
                        onclick="
                            abrirModalGasto(
                                ${indiceOriginal}
                            )
                        "
                    >
                        ✏️ Editar
                    </button>


                    <button
                        type="button"
                        onclick="
                            eliminarGasto(
                                ${indiceOriginal}
                            )
                        "
                    >
                        🗑️ Eliminar
                    </button>

                </div>

            `;


            contenedor.appendChild(
                elemento
            );

        }
    );


    actualizarResumenGastos();

}


// ======================================================
// ELIMINAR GASTO
// ======================================================

function eliminarGasto(indice) {

    const gasto =
        gastos[indice];


    if (!gasto) {

        return;

    }


    const confirmar =
        confirm(
            `¿Querés eliminar "${gasto.nombre}"?`
        );


    if (!confirmar) {

        return;

    }


    gastos.splice(
        indice,
        1
    );


    guardarDatos();

    mostrarGastos();

    actualizarInicio();

    calcularSiCorresponde();

}


// ======================================================
// TOTAL DE GASTOS
// ======================================================

function calcularTotalGastos() {

    return gastos.reduce(
        function (total, gasto) {

            return total +
                Number(gasto.monto || 0);

        },
        0
    );

}


// ======================================================
// NOMBRE DE CATEGORÍA
// ======================================================

function nombreCategoria(codigo) {

    if (codigo === "comida") {

        return "🍔 Comida";

    }


    if (codigo === "vehiculo") {

        return "🚗 Vehículo";

    }


    if (codigo === "extra") {

        return "🎯 Extra";

    }


    if (codigo === "ahorro") {

        return "🏦 Ahorro";

    }


    if (
        codigo &&
        codigo.startsWith(
            "personalizada_"
        )
    ) {

        const id =
            Number(
                codigo.replace(
                    "personalizada_",
                    ""
                )
            );


        const categoria =
            categorias.find(
                function (item) {

                    return item.id === id;

                }
            );


        if (categoria) {

            return "📌 " +
                escaparHTML(
                    categoria.nombre
                );

        }

    }


    return "📌 Categoría";

}


// ======================================================
// FORMATEAR FECHA
// ======================================================

function formatearFecha(fecha) {

    if (!fecha) {

        return "";

    }


    const partes =
        fecha.split("-");


    if (partes.length !== 3) {

        return fecha;

    }


    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// ======================================================
// RESUMEN DE GASTOS
// ======================================================

function actualizarResumenGastos() {

    const contenedor =
        document.getElementById(
            "resumenGastos"
        );


    if (!contenedor) {

        return;

    }


    const total =
        calcularTotalGastos();


    contenedor.innerHTML = `

        <div class="tarjeta-resumen">

            <span>
                💳 Total gastado
            </span>

            <strong>
                ${dinero(total)}
            </strong>

        </div>


        <div class="tarjeta-resumen">

            <span>
                🧾 Cantidad de gastos
            </span>

            <strong>
                ${gastos.length}
            </strong>

        </div>

    `;

}


// ======================================================
// ACTUALIZAR INICIO
// ======================================================

function actualizarInicio() {

    const ingreso =
        Number(
            document.getElementById(
                "ingreso"
            ).value
        );


    const gastosFijos =
        Number(
            document.getElementById(
                "gastosFijos"
            ).value
        );


    const porcentajeAhorro =
        Number(
            document.getElementById(
                "porcentajeAhorro"
            ).value
        );


    const porcentajeComida =
        Number(
            document.getElementById(
                "porcentajeComida"
            ).value
        );


    const montoVehiculo =
        Number(
            document.getElementById(
                "montoVehiculo"
            ).value
        );


    const montoExtra =
        Number(
            document.getElementById(
                "montoExtra"
            ).value
        );


    const totalCategorias =
        categorias.reduce(
            function (total, categoria) {

                return total +
                    Number(categoria.monto || 0);

            },
            0
        );


    const totalGastado =
        calcularTotalGastos();


    const disponibleInicial =
        ingreso -
        gastosFijos;


    const dineroParaPorcentajes =
        disponibleInicial -
        montoVehiculo -
        montoExtra -
        totalCategorias;


    const ahorro =
        Math.max(
            dineroParaPorcentajes,
            0
        ) *
        porcentajeAhorro /
        100;


    const despuesAhorro =
        dineroParaPorcentajes -
        ahorro;


    const comida =
        Math.max(
            despuesAhorro,
            0
        ) *
        porcentajeComida /
        100;


    const restante =
        disponibleInicial -
        ahorro -
        comida -
        montoVehiculo -
        montoExtra -
        totalCategorias -
        totalGastado;


    const inicioIngreso =
        document.getElementById(
            "inicioIngreso"
        );


    const inicioFijos =
        document.getElementById(
            "inicioFijos"
        );


    const inicioGastos =
        document.getElementById(
            "inicioGastos"
        );


    const inicioAhorro =
        document.getElementById(
            "inicioAhorro"
        );


    const inicioRestante =
        document.getElementById(
            "inicioRestante"
        );


    if (inicioIngreso) {

        inicioIngreso.innerText =
            dinero(ingreso);

    }


    if (inicioFijos) {

        inicioFijos.innerText =
            dinero(gastosFijos);

    }


    if (inicioGastos) {

        inicioGastos.innerText =
            dinero(totalGastado);

    }


    if (inicioAhorro) {

        inicioAhorro.innerText =
            dinero(ahorro);

    }


    if (inicioRestante) {

        inicioRestante.innerText =
            dinero(restante);

    }


    const estado =
        document.getElementById(
            "estadoFinanciero"
        );


    if (!estado) {

        return;

    }


    if (ingreso <= 0) {

        estado.innerHTML = `

            <strong>
                📊 Todavía no calculaste tu presupuesto.
            </strong>

            <p>
                Completá tu presupuesto para ver tu estado.
            </p>

        `;

        return;

    }


    if (restante < 0) {

        estado.innerHTML = `

            <strong>
                🔴 Atención: estás gastando
                más de lo disponible.
            </strong>

            <p>
                Revisá tus categorías y gastos registrados.
            </p>

        `;

    }

    else if (
        restante <
        ingreso * 0.10
    ) {

        estado.innerHTML = `

            <strong>
                🟡 Cuidado: te queda poco dinero disponible.
            </strong>

            <p>
                Te quedan
                ${dinero(restante)}
                disponibles.
            </p>

        `;

    }

    else {

        estado.innerHTML = `

            <strong>
                🟢 Vas bien con tu presupuesto.
            </strong>

            <p>
                Después de tus gastos te quedan
                ${dinero(restante)}
                disponibles.
            </p>

        `;

    }

}


// ======================================================
// CALCULAR SI CORRESPONDE
// ======================================================

function calcularSiCorresponde() {

    const ingreso =
        Number(
            document.getElementById(
                "ingreso"
            ).value
        );


    if (ingreso > 0) {

        calcular();

    }

    else {

        actualizarInicio();

    }

}


// ======================================================
// HISTORIAL
// ======================================================

function guardarHistorial() {

    localStorage.setItem(
        CLAVE_HISTORIAL,
        JSON.stringify(
            historialMeses
        )
    );

}


function cargarHistorial() {

    const guardado =
        localStorage.getItem(
            CLAVE_HISTORIAL
        );


    if (!guardado) {

        historialMeses = [];

    }

    else {

        try {

            historialMeses =
                JSON.parse(guardado);

        }

        catch (error) {

            historialMeses = [];

        }

    }


    mostrarHistorial();

}


// ======================================================
// GUARDAR MES
// ======================================================

function guardarMesActual() {

    const ingreso =
        Number(
            document.getElementById(
                "ingreso"
            ).value
        );


    if (ingreso <= 0) {

        alert(
            "Primero completá tu presupuesto."
        );

        return;

    }


    const mes = {

        id:
            Date.now(),

        fecha:
            new Date().toISOString(),

        ingreso:
            ingreso,

        gastosFijos:
            Number(
                document.getElementById(
                    "gastosFijos"
                ).value
            ),

        porcentajeAhorro:
            Number(
                document.getElementById(
                    "porcentajeAhorro"
                ).value
            ),

        porcentajeComida:
            Number(
                document.getElementById(
                    "porcentajeComida"
                ).value
            ),

        montoVehiculo:
            Number(
                document.getElementById(
                    "montoVehiculo"
                ).value
            ),

        montoExtra:
            Number(
                document.getElementById(
                    "montoExtra"
                ).value
            ),

        categorias:
            JSON.parse(
                JSON.stringify(
                    categorias
                )
            ),

        gastos:
            JSON.parse(
                JSON.stringify(
                    gastos
                )
            )

    };


    historialMeses.unshift(
        mes
    );


    guardarHistorial();

    mostrarHistorial();


    alert(
        "✅ El mes fue guardado correctamente."
    );

}


// ======================================================
// MOSTRAR HISTORIAL
// ======================================================

function mostrarHistorial() {

    const contenedor =
        document.getElementById(
            "historial"
        );


    if (!contenedor) {

        return;

    }


    if (
        historialMeses.length === 0
    ) {

        contenedor.innerHTML = `

            <p>
                Todavía no guardaste ningún mes.
            </p>

        `;

        return;

    }


    contenedor.innerHTML = "";


    historialMeses.forEach(
        function (mes) {

            const fecha =
                new Date(
                    mes.fecha
                );


            let nombreMes =
                fecha.toLocaleDateString(
                    "es-AR",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            nombreMes =
                nombreMes.charAt(0).toUpperCase() +
                nombreMes.slice(1);


            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "mes-historial";


            elemento.innerHTML = `

                <div>

                    <h3>
                        📅 ${nombreMes}
                    </h3>


                    <p>
                        💰 Ingreso:

                        <strong>
                            ${dinero(
                                mes.ingreso
                            )}
                        </strong>
                    </p>

                </div>


                <div class="mes-botones">

                    <button
                        type="button"
                        onclick="
                            verDetallesMes(
                                ${mes.id}
                            )
                        "
                    >
                        👁️ Ver detalles
                    </button>


                    <button
                        type="button"
                        onclick="
                            eliminarMes(
                                ${mes.id}
                            )
                        "
                    >
                        🗑️
                    </button>

                </div>

            `;


            contenedor.appendChild(
                elemento
            );

        }
    );

}


// ======================================================
// DETALLES DEL MES
// ======================================================

function verDetallesMes(id) {

    const mes =
        historialMeses.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!mes) {

        return;

    }


    const fecha =
        new Date(
            mes.fecha
        );


    let nombreMes =
        fecha.toLocaleDateString(
            "es-AR",
            {
                month: "long",
                year: "numeric"
            }
        );


    nombreMes =
        nombreMes.charAt(0).toUpperCase() +
        nombreMes.slice(1);


    document.getElementById(
        "detalleMesTitulo"
    ).innerText =
        "📅 " +
        nombreMes;


    document.getElementById(
        "detalleMesFecha"
    ).innerText =
        "Guardado el " +
        fecha.toLocaleDateString(
            "es-AR"
        );


    const totalGastos =
        (mes.gastos || []).reduce(
            function (total, gasto) {

                return total +
                    Number(gasto.monto || 0);

            },
            0
        );


    const contenido =
        document.getElementById(
            "detalleContenido"
        );


    contenido.innerHTML = `

        <div class="detalle-fila">

            <span>
                💰 Ingreso
            </span>

            <strong>
                ${dinero(mes.ingreso)}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                🏠 Gastos fijos
            </span>

            <strong>
                ${dinero(mes.gastosFijos)}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                🏦 Ahorro
            </span>

            <strong>
                ${mes.porcentajeAhorro}%
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                🍔 Comida
            </span>

            <strong>
                ${mes.porcentajeComida}%
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                🚗 Vehículo
            </span>

            <strong>
                ${dinero(mes.montoVehiculo)}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                🎯 Extra
            </span>

            <strong>
                ${dinero(mes.montoExtra)}
            </strong>

        </div>


        <div class="detalle-fila">

            <span>
                💳 Gastos realizados
            </span>

            <strong>
                ${dinero(totalGastos)}
            </strong>

        </div>


        <hr>


        <h3>
            📋 Gastos del mes
        </h3>

    `;


    if (
        mes.gastos &&
        mes.gastos.length > 0
    ) {

        mes.gastos.forEach(
            function (gasto) {

                contenido.innerHTML += `

                    <div class="detalle-fila">

                        <span>

                            ${escaparHTML(
                                gasto.nombre
                            )}

                            <small>
                                ${nombreCategoria(
                                    gasto.categoria
                                )}
                            </small>

                        </span>


                        <strong>
                            ${dinero(
                                gasto.monto
                            )}
                        </strong>

                    </div>

                `;

            }
        );

    }

    else {

        contenido.innerHTML += `

            <p>
                No hubo gastos registrados.
            </p>

        `;

    }


    const detalle =
        document.getElementById(
            "detalleMes"
        );


    detalle.style.display =
        "block";


    detalle.scrollIntoView({
        behavior: "smooth"
    });

}


// ======================================================
// ELIMINAR MES DEL HISTORIAL
// ======================================================

function eliminarMes(id) {

    const confirmar =
        confirm(
            "¿Querés eliminar este mes del historial?"
        );


    if (!confirmar) {

        return;

    }


    historialMeses =
        historialMeses.filter(
            function (mes) {

                return mes.id !== id;

            }
        );


    guardarHistorial();

    mostrarHistorial();

}


// ======================================================
// EVENTOS
// ======================================================

document
    .getElementById("btnCalcular")
    .addEventListener(
        "click",
        calcular
    );


document
    .getElementById("btnEditarDistribucion")
    .addEventListener(
        "click",
        mostrarDistribucion
    );


document
    .getElementById("btnAgregarCategoria")
    .addEventListener(
        "click",
        function () {

            abrirModalCategoria();

        }
    );


document
    .getElementById("btnGuardarCategoria")
    .addEventListener(
        "click",
        guardarCategoria
    );


document
    .getElementById("btnCancelarCategoria")
    .addEventListener(
        "click",
        cerrarModalCategoria
    );


document
    .getElementById("btnAgregarGasto")
    .addEventListener(
        "click",
        function () {

            abrirModalGasto();

        }
    );


document
    .getElementById("btnGuardarGasto")
    .addEventListener(
        "click",
        guardarGasto
    );


document
    .getElementById("btnCancelarGasto")
    .addEventListener(
        "click",
        cerrarModalGasto
    );


document
    .getElementById("btnGuardarMes")
    .addEventListener(
        "click",
        guardarMesActual
    );


document
    .getElementById("btnCerrarDetalle")
    .addEventListener(
        "click",
        function () {

            document.getElementById(
                "detalleMes"
            ).style.display =
                "none";

        }
    );


// ======================================================
// GUARDAR AUTOMÁTICAMENTE LOS CAMPOS
// ======================================================

const camposPresupuesto = [

    "ingreso",
    "gastosFijos",
    "porcentajeAhorro",
    "porcentajeComida",
    "montoVehiculo",
    "montoExtra"

];


camposPresupuesto.forEach(
    function (id) {

        document
            .getElementById(id)
            .addEventListener(
                "input",
                function () {

                    guardarDatos();

                    actualizarInicio();

                }
            );

    }
);


// ======================================================
// CERRAR MODALES TOCANDO AFUERA
// ======================================================

window.addEventListener(
    "click",
    function (evento) {

        const modalCategoria =
            document.getElementById(
                "modalCategoria"
            );


        const modalGasto =
            document.getElementById(
                "modalGasto"
            );


        if (
            evento.target ===
            modalCategoria
        ) {

            cerrarModalCategoria();

        }


        if (
            evento.target ===
            modalGasto
        ) {

            cerrarModalGasto();

        }

    }
);


// ======================================================
// INICIAR APLICACIÓN
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarDatos();

        cargarHistorial();


        document.getElementById(
            "fechaGasto"
        ).value =
            fechaHoy();

    }
);