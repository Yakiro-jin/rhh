class Empleado:
    def __init__(self, cedula, nombre, apellido, email_personal, fecha_ingreso, 
                 cargo_id, departamento_id, telefono=None, estatus='activo', id=None):
        self.id = id
        self.cedula = cedula
        self.nombre = nombre
        self.apellido = apellido
        self.email_personal = email_personal
        self.telefono = telefono
        self.fecha_ingreso = fecha_ingreso
        self.cargo_id = cargo_id
        self.departamento_id = departamento_id
        self.estatus = estatus

    def to_dict(self):
        return {
            "id": self.id,
            "cedula": self.cedula,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email_personal": self.email_personal,
            "telefono": self.telefono,
            "fecha_ingreso": str(self.fecha_ingreso),
            "cargo_id": self.cargo_id,
            "departamento_id": self.departamento_id,
            "estatus": self.estatus
        }