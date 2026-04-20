# medistock-grupo5
# MEDISTOCK

Sistema de gestión de inventario orientado a la industria de la salud (B2B y B2C).

---

## 🌿 Estrategia de Ramas (Git)

Este proyecto utiliza una estrategia basada en buenas prácticas para mantener orden, estabilidad y trabajo en equipo dentro del repositorio en GitHub.

---

## 📌 Ramas principales

### 🔹 main

* Rama de **producción**
* Contiene la versión estable del sistema
* ❌ No se debe trabajar directamente aquí

---

### 🔹 develop

* Rama de **desarrollo principal**
* Aquí se integran todas las funcionalidades antes de pasar a producción

---

## 🛠️ Ramas de trabajo

### 🔸 feature/*

* Para nuevas funcionalidades

**Ejemplos:**

* `feature/inventario`
* `feature/login`
* `feature/pedidos`

📌 Se crean desde `develop`
📌 Se fusionan en `develop`

---

### 🔸 fix/* o bugfix/*

* Para corregir errores en desarrollo

**Ejemplo:**

* `fix/error-stock`

---

### 🔸 hotfix/*

* Para errores críticos en producción

📌 Se crean desde `main`
📌 Se fusionan en:

* `main`
* `develop`

---

## 🔁 Flujo de trabajo

1. Crear una rama desde `develop`
2. Desarrollar la funcionalidad
3. Hacer commits y subir cambios
4. Crear Pull Request hacia `develop`
5. Revisar y aprobar cambios
6. Hacer merge

---

## 🚀 Paso a producción

Cuando `develop` esté estable:

* Se hace merge a `main`

---

## ⚠️ Reglas importantes

* ❌ No trabajar directamente en `main`
* ❌ No subir código sin probar
* ❌ No hacer merge sin revisión
* ✅ Usar nombres claros en las ramas
* ✅ Hacer commits descriptivos
* ✅ Usar Pull Requests

---

## 📂 Estructura del proyecto

* `backend/` → lógica del servidor
* `frontend/` → interfaz de usuario
* `docs/` → documentación

---

## 🧠 Nota

Esta estrategia permite:

* Trabajo en equipo sin conflictos
* Mayor control del código
* Escalabilidad del proyecto
