class Usuario:
    def __init__(self, username, email, password, rol, empleado_id, activo=1, id=None):
        self.id = id
        self.username = username
        self.email = email
        self.password = password  # Aquí se guardará el hash de bcrypt
        self.rol = rol
        self.empleado_id = empleado_id
        self.activo = activo

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "rol": self.rol,
            "empleado_id": self.empleado_id,
            "activo": self.activo
        }