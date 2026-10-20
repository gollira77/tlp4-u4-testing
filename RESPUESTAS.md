# Respuestas

## 1️⃣ ¿Qué diferencia hay entre comprobar manualmente una respuesta y ejecutar una prueba automatizada?

Una **comprobación manual** requiere que una persona ejecute acciones (abrir el navegador, mandar un `curl`, mirar la respuesta) y decida si el resultado es correcto. Es útil para explorar y descubrir casos nuevos, pero depende del tiempo humano, no se repite igual dos veces y pierde valor cuando el sistema crece.

Una **prueba automatizada** está expresada en código: define una entrada, ejecuta la acción y usa una aserción (`expect(...).toBe(...)`, `.toThrow(...)`, etc.) para comparar el resultado observado con el esperado. Se puede correr miles de veces con un solo comando (`npm test`), devuelve el mismo veredicto cada vez y detecta **regresiones** (bugs que aparecen al modificar algo que antes funcionaba).

Las dos son complementarias (teoría §2): la manual sirve para explorar; la automatizada, para verificar lo que ya conocemos después de cada cambio.

## 2️⃣ ¿Cuál fue la causa de la primera prueba fallida?

La prueba `rechaza descuentos superiores al 100 %` esperaba que `calcularPrecioFinal(1000, 150)` lanzara un `RangeError`. Sin embargo, la implementación original de `src/services/precios.ts` no validaba las entradas: aplicaba la fórmula a cualquier número y devolvía `-500` para ese caso.

La causa, entonces, era un **defecto de implementación, no de la prueba**. La prueba expresaba correctamente la regla de negocio ("un descuento mayor al 100 % debe rechazarse") y el código no la cumplía. Se corrigió agregando dos *guard clauses* al inicio de la función.

## 3️⃣ ¿Por qué es útil incluir casos inválidos además de los casos habituales?

Porque un sistema solo demuestra que es robusto cuando también **rechaza bien lo que no debería aceptar**, no solo cuando funciona con lo que sí debería.

Un *test suite* que solo cubre el camino feliz (descuento del 10 %, descuento 0) mide capacidad de funcionar cuando todo está bien; los casos inválidos (descuento 150, precio negativo, `NaN`) miden capacidad de defenderse ante entradas incorrectas. El bug original de este laboratorio es un ejemplo perfecto: la API devolvía `200 OK` con un total de `-500` porque nunca se había comprobado el caso inválido.

Teoría §3 lo plantea así: los casos pueden ser **habituales**, **límite** o **inválidos**, y las tres categorías aportan garantías distintas. Si el equipo mañana refactoriza el código, los casos inválidos son los que atrapan errores silenciosos.

## 4️⃣ ¿Qué parte del sistema comprueba `tests/precios.test.ts` y qué partes comprueba `tests/api.test.ts`?

**`tests/precios.test.ts`** comprueba una **unidad aislada**: la función `calcularPrecioFinal`. Importa la función directamente y la llama con argumentos; no participa Express, ni HTTP, ni JSON. Si la función devuelve el número esperado o lanza el error esperado, la prueba pasa. Son **pruebas unitarias** (teoría §4).

**`tests/api.test.ts`** comprueba la **colaboración de varias piezas**: el routing de Express, el middleware `express.json()`, el handler de la ruta en `app.ts`, la función `calcularPrecioFinal` y el `try/catch` que mapea `RangeError` a HTTP 400. Usa Supertest para hacer requests contra la app en memoria y verifica el status HTTP y el body de la respuesta. Son **pruebas de integración** (teoría §4).

Juntas cubren dos preguntas distintas: "¿La función hace su trabajo?" (unitaria) y "¿La API expone correctamente ese trabajo al cliente?" (integración). Si una falla y la otra no, la ubicación del defecto queda más clara.

## 5️⃣ ¿Qué ventajas ofrece ejecutar las pruebas después de cada modificación?

Tres ventajas concretas:

- **Detectar regresiones de inmediato.** Una regresión es un bug introducido al modificar algo que ya funcionaba. Si vuelvo a correr las 10 pruebas después de cada cambio, cualquier regresión aparece al instante, no una semana después en producción.
- **Confianza para refactorizar.** Con una red de pruebas verdes, puedo cambiar la implementación interna (ej: optimizar la fórmula, extraer una función) sin miedo: si todo sigue en verde, el comportamiento se conservó.
- **Documentar el comportamiento esperado.** Las pruebas describen qué debe hacer cada parte del sistema con ejemplos concretos (descuento 10 → total 900, descuento 150 → `RangeError`). Leer los tests es, muchas veces, la forma más rápida de entender un módulo.

Y si además se corren en CI (GitHub Actions, paso 9), esas garantías se extienden al equipo: cada push se verifica automáticamente antes de mergear.

---

# 🎯 BONUS — Preguntas de repaso de la teoría (§12)

## T1. ¿Por qué una API que devuelve una respuesta HTTP 200 puede contener errores de negocio?

Porque el código HTTP solo indica cómo le fue a la conversación de red, no si el resultado tiene sentido comercial. Un `200 OK` significa "recibí tu pedido, lo procesé y te devuelvo una respuesta válida", pero esa respuesta puede ser disparatada a nivel de negocio.

El caso de este laboratorio lo ilustra: `POST /api/precios/calcular` con `descuento: 150` devolvía `200 OK` y body `{ total: -500 }`. Técnicamente la petición "funcionó": no hubo excepción, no hubo timeout, el JSON se formó. Pero un total negativo no tiene sentido en un sistema de ventas.

Por eso las pruebas automatizadas verifican la **regla de negocio** (y no solo "¿respondió?"): comprueban que la respuesta sea la que corresponde según los requisitos.

## T2. ¿Qué diferencia hay entre una prueba unitaria y una de integración?

Una **prueba unitaria** verifica una pieza aislada del sistema (en nuestro caso, la función `calcularPrecioFinal`). Involucra solo esa pieza; si la prueba falla, el defecto está dentro de ella.

Una **prueba de integración** verifica cómo colaboran varias piezas. En nuestro `api.test.ts`, cada test atraviesa el routing de Express, el middleware JSON, el handler, el servicio y el manejo de errores. Si falla, el defecto puede estar en cualquiera de esas piezas o en la forma en que se conectan.

La pirámide de pruebas (teoría §4) sugiere tener muchas unitarias y menos de integración: las unitarias son baratas y precisas; las de integración son más caras y lentas pero atrapan los defectos "entre partes" que las unitarias no ven.

## T3. ¿Por qué `toThrow` recibe una función en lugar del resultado de ejecutarla?

Porque `toThrow` necesita **ejecutar la operación bajo observación**: tiene que correrla dentro de un `try/catch` interno para detectar si lanza un error.

Si escribís `expect(calcularPrecioFinal(1000, 150)).toThrow(...)`, la función se ejecuta **antes** de que `expect` reciba nada. Dos problemas:

1. Si lanza un error, lo hace fuera del alcance de `toThrow`: Vitest nunca llega a inspeccionar nada.
2. Si no lanza (como pasaba en el estado inicial del laboratorio), `expect(-500)` recibe un número, y `.toThrow()` sobre un número no tiene sentido.

Al escribir `expect(() => calcularPrecioFinal(1000, 150)).toThrow(RangeError)`, le entregás la función a Vitest. Vitest decide cuándo ejecutarla y la envuelve en su propio `try/catch` para capturar lo que suceda. Teoría §6.

## T4. ¿Qué diferencia existe entre `npm test` y `npm run typecheck`?

Responden preguntas distintas sobre el código:

- **`npm test`** (ejecuta `vitest run`) corre el código con entradas concretas y verifica, mediante aserciones, que el comportamiento observado coincida con el esperado. Caza bugs de **lógica** y de **reglas de negocio**.
- **`npm run typecheck`** (ejecuta `tsc --noEmit`) analiza los tipos **sin ejecutar nada**. TypeScript verifica que todas las llamadas, asignaciones y retornos sean coherentes con los tipos declarados. Caza bugs de **forma**: parámetros equivocados, retornos faltantes, propiedades mal escritas.

Son complementarias: un código puede estar tipado correctamente y hacer algo incorrecto; o puede hacer lo correcto pero con tipos mal declarados. Por eso en CI (paso 9) corremos primero `typecheck` y después `test`.

Un detalle importante: Node 22.18+ ejecuta `.ts` directamente pero **borra los tipos antes de ejecutar**, por lo que no los chequea. De ahí la necesidad de correr `tsc` aparte.

## T5. ¿Qué aporta GitHub Actions al trabajo colaborativo?

GitHub Actions automatiza la verificación de cada cambio antes de que se mergee. Cada push dispara el workflow `pruebas.yml`, que corre `npm ci`, `npm run typecheck` y `npm test` en una máquina limpia. En un equipo:

- Los defectos se ven en el momento del push, no al mergear.
- Las ejecuciones son reproducibles gracias a `npm ci` + `package-lock.json`.
- Las PR muestran el estado (verde/rojo) para que la revisión se concentre en la lógica.
- Nadie se "olvida" de correr tests o chequear tipos: la pipeline lo hace siempre.
