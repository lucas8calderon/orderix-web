import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CategoryContainer } from './Category';
import { CategoryProvider } from './providers/CategoryContext';
import { useGetCategories, usePostCategory } from './hooks/useGetCategories';

jest.mock('./hooks/useGetCategories', () => ({
  useGetCategories: jest.fn(),
  usePostCategory: jest.fn(),
}));

jest.mock('./hooks/useDeleteCategories', () => ({
  useDeleteCategory: () => ({
    deleteCategoryById: jest.fn(),
    successToDeleteCategory: false,
    errorToDeleteCategory: false,
    resetDeleteStateCategory: jest.fn(),
    errorMessage: '',
  }),
}));

jest.mock('./service/categoryService', () => ({
  reorderCategories: jest.fn(),
}));

const caldos = { id: 1, name: 'Caldos', active: true, parentId: null };

function renderCategories() {
  return render(
    <CategoryProvider>
      <CategoryContainer />
    </CategoryProvider>,
  );
}

describe('interruptor da categoria', () => {
  const saveCategory = jest.fn(() => Promise.resolve({}));

  beforeEach(() => {
    jest.clearAllMocks();
    useGetCategories.mockReturnValue({
      categories: [caldos],
      loading: false,
      error: false,
      refetch: jest.fn(),
    });
    usePostCategory.mockReturnValue({
      saveCategory,
      saving: false,
      errorMessage: '',
      resetSaveState: jest.fn(),
    });
  });

  it('desativa a categoria pelo interruptor da lista', async () => {
    renderCategories();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Desativar Caldos' }));
    await waitFor(() => {
      expect(saveCategory).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Caldos',
        active: false,
      }));
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
