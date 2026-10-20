# Laboratorio introductorio: testing en Express y TypeScript

**Taller de Lenguajes de Programación IV — Unidad 4**

Este proyecto usa **Node.js 22.18 o posterior** (se recomienda Node.js 24), Express y TypeScript nativo: Node ejecuta los archivos `.ts` directamente, sin `ts-node`, `tsx`, Babel ni `tsc` para generar JavaScript. TypeScript sigue siendo una dependencia de desarrollo para verificar tipos mediante `tsc --noEmit`.

> La ejecución nativa elimina anotaciones de tipos, pero no transforma todas las características de TypeScript. Para este laboratorio se utiliza sintaxis compatible (sin `enum`, `namespace` con código, ni propiedades de parámetros). Se usan importaciones relativas con extensión `.ts`.

## 1. Preparación

```bash
node --version  # 22.18+ o 24+
npm install
```

## 2. Iniciar el servidor

```bash
npm run dev
```

Abrir `http://localhost:3000/salud` o probar en otra terminal:

```bash
curl -X POST http://localhost:3000/api/precios/calcular \
  -H 'Content-Type: application/json' \
  -d '{"precio":1000,"descuento":10}'
```

## 3. Ejecutar las pruebas

```bash
npm test
```

`tests/precios.test.ts` verifica la función de manera aislada (pruebas unitarias). `tests/api.test.ts` comprueba rutas HTTP con Supertest, sin abrir un puerto (pruebas de integración). `npm run test:watch` reejecuta pruebas al guardar cambios.

## 4. Actividades

1. Ejecutá `npm test`. ¿Cuántas pruebas pasan y cuántas fallan? 
2. Buscá el test que rechaza un descuento del 150 %. ¿Por qué falla?
3. Agregá validaciones a `src/services/precios.ts` para rechazar precios inválidos y descuentos fuera de 0 a 100. Usá `RangeError`.
4. Repetí `npm test` hasta que las pruebas pasen.
5. Agregá pruebas para descuento del 100 %, precio negativo y descuento negativo.
6. Agregá una prueba de integración que envíe un descuento del 150 % y espere HTTP 400.
7. Ejecutá `npm run typecheck`. Diferenciá el chequeo estático de tipos de las pruebas automatizadas.

**Preguntas de cierre:** ¿Qué descubre el test que una prueba manual podría pasar por alto? ¿Por qué se vuelven a ejecutar todas las pruebas después de corregir el código?

## 5. Opcional: integración continua

El proyecto incluye `.github/workflows/pruebas.yml`. Para utilizarlo en GitHub, subí el repositorio. El workflow utiliza `npm install` para que también funcione sin un lockfile incluido en el ZIP. Después de instalar localmente, se recomienda versionar el archivo `package-lock.json` y cambiar el workflow a `npm ci` para instalaciones reproducibles. El flujo instalará dependencias y ejecutará el chequeo de tipos y las pruebas.

## Importante para el laboratorio

No corrijas la función `src/services/precios.ts` antes de realizar las etapas de diagnóstico. La prueba fallida es intencional; la guía práctica indica cuándo implementar las validaciones.
