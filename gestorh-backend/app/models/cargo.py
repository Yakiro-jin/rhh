class Cargo:
    def __init__(self, id, nombre, departamento_id):
        self.id = id
        self.nombre = nombre
        self.departamento_id = departamento_id

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'departamento_id': self.departamento_id
        }