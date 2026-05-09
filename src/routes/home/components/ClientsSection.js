import React, { useState } from 'react';
import '../styles/ClientsSection.css';

const ClientsSection = ({ onLoginClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    cnpj: '',
    revenue: '',
    state: '',
    employees: '',
    phone: '',
    plan: 'ainda-nao-tenho-certeza'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the data for WhatsApp
    const message = `
Olá! Gostaria de saber mais sobre o sistema Orderix.

*Informações do Contato:*
Nome: ${formData.name}
E-mail: ${formData.email}
Telefone: ${formData.phone}

*Empresa:*
Nome: ${formData.company}
CNPJ/CPF: ${formData.cnpj}
Estado: ${formData.state}
Faturamento Mensal: ${formData.revenue}
Funcionários: ${formData.employees}

*Plano de Interesse:*
${formData.plan === 'basico' ? 'Básico (R$ 49,99/mês)' : 
  formData.plan === 'profissional' ? 'Profissional (R$ 99,99/mês)' : 
  formData.plan === 'premium' ? 'Premium (R$ 199,99/mês)' : 
  'Ainda não tenho certeza do plano'}

Por favor, entre em contato!
    `.trim();

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with the phone number
    const whatsappUrl = `https://wa.me/5511977844172?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const testimonials = [
    {
      name: 'Maria Silva',
      role: 'Proprietária - Restaurante Sabor & Arte',
      text: 'O Orderix transformou a forma como gerenciamos nosso restaurante. Agora temos controle total sobre pedidos e mesas.',
      rating: 5
    },
    {
      name: 'João Santos',
      role: 'Gerente - Bar do João',
      text: 'Reduzimos em 40% o tempo de atendimento. A integração com pagamentos facilitou muito nossa operação.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      role: 'Administradora - Pizzaria Bella',
      text: 'Os relatórios são incríveis! Consigo tomar decisões baseadas em dados reais do meu negócio.',
      rating: 5
    }
  ];

  return (
    <section className="clients-section" id="clients">
      <div className="clients-container">
        <div className="clients-cta">
          <h3>Pronto para começar?</h3>
          <p>Preencha o formulário abaixo e nossa equipe entrará em contato para apresentar a melhor solução para seu negócio</p>
          
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nome *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-mail *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Nome da Empresa *</label>
                <input 
                  type="text" 
                  id="company" 
                  name="company" 
                  value={formData.company}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="cnpj">CNPJ/CPF *</label>
                <input 
                  type="text" 
                  id="cnpj" 
                  name="cnpj" 
                  value={formData.cnpj}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="revenue">Média de Faturamento Mensal *</label>
                <select 
                  id="revenue" 
                  name="revenue" 
                  value={formData.revenue}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="ate-10k">Até R$ 10.000</option>
                  <option value="10k-50k">R$ 10.000 - R$ 50.000</option>
                  <option value="50k-100k">R$ 50.000 - R$ 100.000</option>
                  <option value="100k-500k">R$ 100.000 - R$ 500.000</option>
                  <option value="acima-500k">Acima de R$ 500.000</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="state">Estado *</label>
                <select 
                  id="state" 
                  name="state" 
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="employees">Quantidade de Funcionários *</label>
                <select 
                  id="employees" 
                  name="employees" 
                  value={formData.employees}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="1-5">1 a 5 funcionários</option>
                  <option value="6-10">6 a 10 funcionários</option>
                  <option value="11-20">11 a 20 funcionários</option>
                  <option value="21-50">21 a 50 funcionários</option>
                  <option value="acima-50">Acima de 50 funcionários</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Telefone/WhatsApp</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(11) 99999-9999" 
                />
              </div>
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="plan">Selecione um Plano *</label>
              <select 
                id="plan" 
                name="plan" 
                value={formData.plan}
                onChange={handleInputChange}
                required
              >
                <option value="basico">Básico - R$ 49,99/mês</option>
                <option value="profissional">Profissional - R$ 99,99/mês</option>
                <option value="premium">Premium - R$ 199,99/mês</option>
                <option value="ainda-nao-tenho-certeza">Ainda não tenho certeza do plano</option>
              </select>
            </div>

            <button type="submit" className="btn-submit-form">
              Enviar Solicitação
            </button>
          </form>

          <div className="cta-alternative">
            <p>Já tem uma conta?</p>
            <button className="btn-clients-login" onClick={onLoginClick}>
              Acesse seu painel administrativo
            </button>
          </div>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="testimonial-rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
