from django.urls import path
from core.pos.views import POSView
from core.pos.views.account_payable.views import AccountPayableListView, AccountPayableCreateView, AccountPayableDeleteView
from core.pos.views.account_receivable.views import AccountReceivableListView, AccountReceivableCreateView, AccountReceivableDeleteView
from core.pos.views.category.views import CategoryListView, CategoryCreateView, CategoryUpdateView, CategoryDeleteView
from core.pos.views.company.views import CompanyUpdateView
from core.pos.views.credit_note.views import CreditNoteListView, CreditNoteCreateView, CreditNoteDeleteView, CreditNoteCustomerListView
from core.pos.views.customer.views import CustomerListView, CustomerCreateView, CustomerUpdateView, CustomerDeleteView, CustomerUpdateProfileView
from core.pos.views.expense.views import ExpenseListView, ExpenseCreateView, ExpenseUpdateView, ExpenseDeleteView
from core.pos.views.expense_type.views import ExpenseTypeListView, ExpenseTypeCreateView, ExpenseTypeUpdateView, ExpenseTypeDeleteView
from core.pos.views.invoice.views import InvoiceListView, InvoiceCreateView, InvoiceUpdateView, InvoiceDeleteView, InvoicePrintView, InvoiceCustomerListView
from core.pos.views.product.views import ProductListView, ProductCreateView, ProductUpdateView, ProductDeleteView, ProductStockAdjustmentView, ProductExportExcelView, ProductQrCodeView
from core.pos.views.promotion.views import PromotionListView, PromotionCreateView, PromotionUpdateView, PromotionDeleteView
from core.pos.views.provider.views import ProviderListView, ProviderCreateView, ProviderUpdateView, ProviderDeleteView
from core.pos.views.purchase.views import PurchaseListView, PurchaseCreateView, PurchaseDeleteView
from core.pos.views.quotation.views import QuotationListView, QuotationCreateView, QuotationUpdateView, QuotationDeleteView, QuotationPrintView

app_name = 'pos'

urlpatterns = [
    # tpv
    path('tpv/', POSView.as_view(), name='tpv'),
    path('tpv/search_customers/', POSView.as_view(), name='tpv_search_customers'),
    # company
    path('company/update/', CompanyUpdateView.as_view(), name='company_update'),
    # provider
    path('provider/', ProviderListView.as_view(), name='provider_list'),
    path('provider/add/', ProviderCreateView.as_view(), name='provider_create'),
    path('provider/update/<int:pk>/', ProviderUpdateView.as_view(), name='provider_update'),
    path('provider/delete/<int:pk>/', ProviderDeleteView.as_view(), name='provider_delete'),
    # category
    path('category/', CategoryListView.as_view(), name='category_list'),
    path('category/add/', CategoryCreateView.as_view(), name='category_create'),
    path('category/update/<int:pk>/', CategoryUpdateView.as_view(), name='category_update'),
    path('category/delete/<int:pk>/', CategoryDeleteView.as_view(), name='category_delete'),
    # product
    path('product/', ProductListView.as_view(), name='product_list'),
    path('product/add/', ProductCreateView.as_view(), name='product_create'),
    path('product/update/<int:pk>/', ProductUpdateView.as_view(), name='product_update'),
    path('product/delete/<int:pk>/', ProductDeleteView.as_view(), name='product_delete'),
    path('product/stock/adjustment/', ProductStockAdjustmentView.as_view(), name='product_stock_adjustment'),
    path('product/export/excel/', ProductExportExcelView.as_view(), name='product_export_excel'),
    path('product/qr-code/', ProductQrCodeView.as_view(), name='product_qr_code'),
    # customer
    path('customer/', CustomerListView.as_view(), name='customer_list'),
    path('customer/add/', CustomerCreateView.as_view(), name='customer_create'),
    path('customer/update/<int:pk>/', CustomerUpdateView.as_view(), name='customer_update'),
    path('customer/delete/<int:pk>/', CustomerDeleteView.as_view(), name='customer_delete'),
    path('customer/update/profile/', CustomerUpdateProfileView.as_view(), name='customer_update_profile'),
    # expense_type
    path('expense/type/', ExpenseTypeListView.as_view(), name='expense_type_list'),
    path('expense/type/add/', ExpenseTypeCreateView.as_view(), name='expense_type_create'),
    path('expense/type/update/<int:pk>/', ExpenseTypeUpdateView.as_view(), name='expense_type_update'),
    path('expense/type/delete/<int:pk>/', ExpenseTypeDeleteView.as_view(), name='expense_type_delete'),
    # expense
    path('expense/', ExpenseListView.as_view(), name='expense_list'),
    path('expense/add/', ExpenseCreateView.as_view(), name='expense_create'),
    path('expense/update/<int:pk>/', ExpenseUpdateView.as_view(), name='expense_update'),
    path('expense/delete/<int:pk>/', ExpenseDeleteView.as_view(), name='expense_delete'),
    # promotion
    path('promotion/', PromotionListView.as_view(), name='promotion_list'),
    path('promotion/add/', PromotionCreateView.as_view(), name='promotion_create'),
    path('promotion/update/<int:pk>/', PromotionUpdateView.as_view(), name='promotion_update'),
    path('promotion/delete/<int:pk>/', PromotionDeleteView.as_view(), name='promotion_delete'),
    # purchase
    path('purchase/', PurchaseListView.as_view(), name='purchase_list'),
    path('purchase/add/', PurchaseCreateView.as_view(), name='purchase_create'),
    path('purchase/delete/<int:pk>/', PurchaseDeleteView.as_view(), name='purchase_delete'),
    # account_payable
    path('account/payable/', AccountPayableListView.as_view(), name='account_payable_list'),
    path('account/payable/add/', AccountPayableCreateView.as_view(), name='account_payable_create'),
    path('account/payable/delete/<int:pk>/', AccountPayableDeleteView.as_view(), name='account_payable_delete'),
    # account_receivable
    path('account/receivable/', AccountReceivableListView.as_view(), name='account_receivable_list'),
    path('account/receivable/add/', AccountReceivableCreateView.as_view(), name='account_receivable_create'),
    path('account/receivable/delete/<int:pk>/', AccountReceivableDeleteView.as_view(), name='account_receivable_delete'),
    # invoice
    path('invoice/admin/', InvoiceListView.as_view(), name='invoice_list_admin'),
    path('invoice/admin/add/', InvoiceCreateView.as_view(), name='invoice_create_admin'),
    path('invoice/admin/update/<int:pk>/', InvoiceUpdateView.as_view(), name='invoice_update_admin'),
    path('invoice/admin/delete/<int:pk>/', InvoiceDeleteView.as_view(), name='invoice_delete_admin'),
    path('invoice/admin/print/<int:pk>/', InvoicePrintView.as_view(), name='invoice_print'),
    path('invoice/customer/', InvoiceCustomerListView.as_view(), name='invoice_list_customer'),
    # quotation
    path('quotation/', QuotationListView.as_view(), name='quotation_list'),
    path('quotation/add/', QuotationCreateView.as_view(), name='quotation_create'),
    path('quotation/update/<int:pk>/', QuotationUpdateView.as_view(), name='quotation_update'),
    path('quotation/delete/<int:pk>/', QuotationDeleteView.as_view(), name='quotation_delete'),
    path('quotation/print/<int:pk>/', QuotationPrintView.as_view(), name='quotation_print'),
    # credit note
    path('credit/note/admin/', CreditNoteListView.as_view(), name='credit_note_list_admin'),
    path('credit/note/admin/add/', CreditNoteCreateView.as_view(), name='credit_note_create_admin'),
    path('credit/note/admin/delete/<int:pk>/', CreditNoteDeleteView.as_view(), name='credit_note_delete_admin'),
    path('credit/note/customer/', CreditNoteCustomerListView.as_view(), name='credit_note_list_customer'),
    # invoice print
    path('invoice/print/<int:pk>/', InvoicePrintView.as_view(), name='invoice_print'),
]
