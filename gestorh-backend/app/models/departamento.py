class Departamento:
    def __init__(self, nombre, descripcion=None, id=None):
        self.id = id
        self.nombre = nombre
        self.descripcion = descripcion

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion
        }