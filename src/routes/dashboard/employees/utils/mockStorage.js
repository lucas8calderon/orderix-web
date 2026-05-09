// Mock storage para protótipo - simula backend em memória
let mockEmployees = [
  {
    id: 1,
    name: "João Silva",
    email: "joao.silva@exemplo.com",
    phone: "(11) 98765-4321",
    profile: "GARCOM"
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria.santos@exemplo.com",
    phone: "(11) 97654-3210",
    profile: "COZINHA"
  }
];

let nextId = 3;

// Simula delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockStorage = {
  // Buscar todos os funcionários
  async getEmployees() {
    await delay(300);
    console.log('MockStorage: Buscando funcionários, total:', mockEmployees.length);
    return [...mockEmployees];
  },

  // Criar novo funcionário
  async createEmployee(employee) {
    await delay(500);
    console.log('MockStorage: Criando funcionário:', employee);
    const newEmployee = {
      id: nextId++,
      ...employee
    };
    mockEmployees.push(newEmployee);
    console.log('MockStorage: Funcionário criado:', newEmployee);
    console.log('MockStorage: Total de funcionários:', mockEmployees.length);
    return newEmployee;
  },

  // Atualizar funcionário
  async updateEmployee(employee) {
    await delay(500);
    const index = mockEmployees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
      mockEmployees[index] = { ...employee };
      return mockEmployees[index];
    }
    throw new Error('Funcionário não encontrado');
  },

  // Deletar funcionário
  async deleteEmployee(id) {
    await delay(500);
    const index = mockEmployees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      mockEmployees.splice(index, 1);
      return true;
    }
    throw new Error('Funcionário não encontrado');
  }
};

