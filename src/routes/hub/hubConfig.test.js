import { getActiveLinks, getActiveDemos, PRIMARY_LINK, SECONDARY_LINKS, DEMO_OPTIONS } from './hubConfig';

describe('hubConfig', () => {
  describe('getActiveLinks', () => {
    it('retorna apenas links ativos', () => {
      const links = getActiveLinks();
      expect(links.every(link => link.active)).toBe(true);
    });

    it('retorna links ordenados', () => {
      const links = getActiveLinks();
      for (let i = 1; i < links.length; i++) {
        expect(links[i].order).toBeGreaterThan(links[i - 1].order);
      }
    });

    it('inclui o link principal', () => {
      const links = getActiveLinks();
      expect(links.some(link => link.id === PRIMARY_LINK.id)).toBe(true);
    });

    it('inclui links secundários ativos', () => {
      const links = getActiveLinks();
      const activeSecondary = SECONDARY_LINKS.filter(link => link.active);
      activeSecondary.forEach(secondary => {
        expect(links.some(link => link.id === secondary.id)).toBe(true);
      });
    });
  });

  describe('getActiveDemos', () => {
    it('retorna apenas demonstrações ativas', () => {
      const demos = getActiveDemos();
      expect(demos.every(demo => demo.active)).toBe(true);
    });

    it('retorna demonstrações válidas', () => {
      const demos = getActiveDemos();
      demos.forEach(demo => {
        expect(demo).toHaveProperty('id');
        expect(demo).toHaveProperty('name');
        expect(demo).toHaveProperty('description');
        expect(demo).toHaveProperty('url');
      });
    });

    it('inclui as demonstrações esperadas', () => {
      const demos = getActiveDemos();
      expect(demos.length).toBeGreaterThan(0);
      expect(demos.some(d => d.id === 'weper-burger')).toBe(true);
    });
  });

  describe('PRIMARY_LINK', () => {
    it('possui propriedades obrigatórias', () => {
      expect(PRIMARY_LINK).toHaveProperty('id');
      expect(PRIMARY_LINK).toHaveProperty('title');
      expect(PRIMARY_LINK).toHaveProperty('description');
      expect(PRIMARY_LINK).toHaveProperty('icon');
      expect(PRIMARY_LINK).toHaveProperty('type');
      expect(PRIMARY_LINK).toHaveProperty('active');
      expect(PRIMARY_LINK).toHaveProperty('order');
    });

    it('está marcado como featured', () => {
      expect(PRIMARY_LINK.featured).toBe(true);
    });
  });

  describe('SECONDARY_LINKS', () => {
    it('todos possuem propriedades obrigatórias', () => {
      SECONDARY_LINKS.forEach(link => {
        expect(link).toHaveProperty('id');
        expect(link).toHaveProperty('title');
        expect(link).toHaveProperty('description');
        expect(link).toHaveProperty('icon');
        expect(link).toHaveProperty('type');
        expect(link).toHaveProperty('active');
        expect(link).toHaveProperty('order');
      });
    });

    it('links externos possuem URL', () => {
      SECONDARY_LINKS.filter(link => link.type === 'external').forEach(link => {
        expect(link.url).toBeTruthy();
      });
    });

    it('links modais possuem action', () => {
      SECONDARY_LINKS.filter(link => link.type === 'modal').forEach(link => {
        expect(link.action).toBeTruthy();
      });
    });
  });

  describe('DEMO_OPTIONS', () => {
    it('todas possuem propriedades obrigatórias', () => {
      DEMO_OPTIONS.forEach(demo => {
        expect(demo).toHaveProperty('id');
        expect(demo).toHaveProperty('name');
        expect(demo).toHaveProperty('description');
        expect(demo).toHaveProperty('url');
        expect(demo).toHaveProperty('active');
      });
    });

    it('URLs começam com /', () => {
      DEMO_OPTIONS.forEach(demo => {
        expect(demo.url).toMatch(/^\//);
      });
    });
  });
});
