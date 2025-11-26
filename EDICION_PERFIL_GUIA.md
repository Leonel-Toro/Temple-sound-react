# 📝 Guía de Edición de Perfil

## Descripción General

Sistema completo de edición de perfil de usuario que permite modificar información personal, datos de contacto y contraseña de forma segura.

---

## 🎯 Funcionalidades Implementadas

### 1. **Información Personal**
- ✅ Editar nombre (first_name)
- ✅ Editar apellido (last_name)
- ✅ Validación en tiempo real
- ✅ Campos obligatorios marcados con asterisco

### 2. **Información de Contacto**
- ✅ Editar teléfono (opcional)
- ✅ Editar dirección de envío (opcional)
- ✅ Validación de formato de teléfono

### 3. **Cambio de Contraseña**
- ✅ Sección expandible para cambiar contraseña
- ✅ Verificación de contraseña actual
- ✅ Validación de nueva contraseña (mínimo 6 caracteres)
- ✅ Confirmación de nueva contraseña
- ✅ Validación en tiempo real de coincidencia

### 4. **Interfaz de Usuario**
- ✅ Modo vista/edición alternado
- ✅ Botón "Editar Perfil" en modo vista
- ✅ Formulario completo en modo edición
- ✅ Estilos consistentes con el sistema de autenticación
- ✅ Mensajes de éxito y error
- ✅ Indicadores de carga durante el guardado

---

## 📁 Archivos Modificados/Creados

### Archivos Nuevos:
```
src/components/EditProfileForm.jsx
```

### Archivos Modificados:
```
src/pages/Profile/ProfilePage.jsx
src/context/AuthContext.jsx
```

---

## 🔧 Componentes

### **EditProfileForm.jsx**

Componente de formulario para editar información del perfil.

**Props:**
- `onSuccess`: Función callback al guardar exitosamente
- `onCancel`: Función callback al cancelar la edición

**Características:**
- Validación en tiempo real
- Manejo de errores por campo
- Sección expandible para cambio de contraseña
- Integración con `userService` para actualización
- Actualización automática de sessionStorage

**Ejemplo de uso:**
```jsx
<EditProfileForm 
  onSuccess={(updatedUser) => {
    console.log('Usuario actualizado:', updatedUser);
  }}
  onCancel={() => setIsEditing(false)}
/>
```

---

## 🎨 Estructura del Formulario

### Sección 1: Información Personal
```jsx
- Nombre (first_name) *obligatorio
- Apellido (last_name) *obligatorio
```

### Sección 2: Información de Contacto
```jsx
- Teléfono (phone) - opcional
- Dirección de Envío (shipping_address) - opcional
```

### Sección 3: Cambiar Contraseña (Expandible)
```jsx
- Contraseña Actual *obligatorio si se expande
- Nueva Contraseña *obligatorio si se expande
- Confirmar Nueva Contraseña *obligatorio si se expande
```

---

## 🔐 Validaciones Implementadas

### Nombre y Apellido
- ✅ No puede estar vacío
- ✅ Mínimo 2 caracteres
- ✅ Se elimina espacios en blanco al inicio y final

### Teléfono
- ✅ Formato válido: números, espacios, guiones, paréntesis, +
- ✅ Regex: `/^[\d\s\-\+\(\)]+$/`

### Contraseña Actual
- ✅ Verificación contra el usuario en la base de datos
- ✅ Mensaje de error si no coincide

### Nueva Contraseña
- ✅ Mínimo 6 caracteres
- ✅ No puede estar vacía

### Confirmar Contraseña
- ✅ Debe coincidir con la nueva contraseña
- ✅ Indicador visual de coincidencia

---

## 🔄 Flujo de Actualización

### Paso 1: Usuario hace clic en "Editar Perfil"
```jsx
// En ProfilePage.jsx
<button onClick={() => setIsEditing(true)}>
  Editar Perfil
</button>
```

### Paso 2: Se muestra el formulario de edición
```jsx
{isEditing ? (
  <EditProfileForm 
    onSuccess={handleEditSuccess}
    onCancel={() => setIsEditing(false)}
  />
) : (
  // Vista de solo lectura
)}
```

### Paso 3: Usuario modifica campos y guarda
```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validar formulario
  const newErrors = validateForm();
  
  // Si hay errores, detener
  if (Object.keys(newErrors).length > 0) return;
  
  // Preparar datos
  const updateData = {
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    name: `${formData.first_name.trim()} ${formData.last_name.trim()}`,
    phone: formData.phone.trim(),
    shipping_address: formData.shipping_address.trim(),
  };
  
  // Si se cambia contraseña, verificar y agregar
  if (showPasswordSection) {
    // Verificar contraseña actual
    // Agregar nueva contraseña
  }
  
  // Actualizar usuario
  const updatedUser = await userService.update(user.id, updateData);
  
  // Actualizar sessionStorage
  // Llamar onSuccess
};
```

### Paso 4: Actualización en AuthContext
```jsx
const handleEditSuccess = (updatedUser) => {
  // Actualizar usuario en el contexto
  updateUser(updatedUser);
  
  // Volver a modo vista
  setIsEditing(false);
  
  // Mostrar mensaje de éxito
};
```

---

## 💾 Actualización de sessionStorage

Al guardar cambios, se actualizan las siguientes claves:
```javascript
sessionStorage.setItem('userName', updatedUser.name);
sessionStorage.setItem('userFirstName', updatedUser.first_name);
sessionStorage.setItem('userLastName', updatedUser.last_name);
```

---

## ⚠️ Manejo de Errores

### Errores de Validación
- Se muestran debajo de cada campo
- Ícono de exclamación
- Borde rojo en el input
- Mensaje descriptivo del error

### Errores de Guardado
- Alert en la parte superior del formulario
- Fondo degradado rojo
- Borde izquierdo rojo
- Botón para cerrar

### Error de Contraseña Actual Incorrecta
```jsx
if (currentUser.password !== formData.current_password) {
  setSubmitError('La contraseña actual es incorrecta');
  return;
}
```

---

## 🎨 Estilos Aplicados

### Formulario
- Usa las clases de `auth-styles.css`
- Fondo oscuro con inputs semi-transparentes
- Animaciones de fadeIn para sección de contraseña
- Botones con gradientes

### Botón "Guardar Cambios"
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.4);
transform: translateY(-2px) on hover;
```

### Vista de Solo Lectura
```css
background-color: rgba(255,255,255,0.05); /* Fondo semi-transparente */
border-radius: rounded;
padding: p-3;
```

---

## 🔄 Integración con AuthContext

### Nueva función agregada:
```jsx
const updateUser = (updatedUserData) => {
  setUser(updatedUserData);
};
```

### Exportada en el value:
```jsx
const value = {
  user,
  loading,
  error,
  login,
  register,
  logout,
  isAdmin,
  isAuthenticated,
  hasRole,
  updateUser, // ← Nueva función
};
```

---

## 📱 Responsive Design

### Desktop (md y superior)
- Formulario en 2 columnas para nombre/apellido
- Botones alineados a la derecha
- Vista de perfil en 2 columnas

### Mobile (sm y inferior)
- Formulario en 1 columna
- Botones apilados verticalmente
- Vista de perfil apilada

---

## 🧪 Casos de Prueba Recomendados

### 1. Editar solo nombre y apellido
- ✅ Verificar que se actualice correctamente
- ✅ Verificar que `name` se genere automáticamente

### 2. Editar teléfono y dirección
- ✅ Agregar desde vacío
- ✅ Modificar existente
- ✅ Dejar vacío

### 3. Cambiar contraseña
- ✅ Contraseña actual incorrecta → Error
- ✅ Nueva contraseña muy corta → Error
- ✅ Confirmación no coincide → Error
- ✅ Todo correcto → Éxito

### 4. Cancelar edición
- ✅ Verificar que vuelva a modo vista
- ✅ Verificar que no se guarden cambios

### 5. Validaciones en tiempo real
- ✅ Error desaparece al corregir
- ✅ Check verde aparece cuando es válido

---

## 🚀 Próximas Mejoras Sugeridas

1. **Validación de Email**
   - Permitir cambiar email
   - Requerir verificación por email

2. **Imagen de Perfil**
   - Subir foto de perfil
   - Preview antes de guardar

3. **Historial de Cambios**
   - Registro de modificaciones
   - Fecha de último cambio

4. **Verificación en Dos Pasos**
   - Requerir contraseña para cambios importantes
   - Código por email/SMS

5. **Preferencias**
   - Idioma
   - Zona horaria
   - Notificaciones

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor:
1. Revisa la consola del navegador para errores
2. Verifica que `userService.update()` esté funcionando
3. Asegúrate de que el usuario esté autenticado
4. Verifica que los datos en sessionStorage sean correctos

---

## ✅ Checklist de Implementación

- [x] Componente `EditProfileForm.jsx` creado
- [x] Integración en `ProfilePage.jsx`
- [x] Función `updateUser` en `AuthContext.jsx`
- [x] Validaciones de formulario
- [x] Verificación de contraseña actual
- [x] Actualización de sessionStorage
- [x] Estilos consistentes
- [x] Mensajes de éxito/error
- [x] Responsive design
- [x] Documentación completa

---

**¡Sistema de edición de perfil completamente implementado y funcional! 🎉**
