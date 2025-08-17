import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import AgGrid from "ag-grid-solid";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const API_URL = "https://mindmate-be-production.up.railway.app/api/journals";

type JournalEntry = {
  id: number;
  title: string;
  content: string;
  created_at: string; // MM-DD-YYYY or ISO
};

function formatDateMMDDYYYY(dateStr: string) {
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

const Journal: Component = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);
  const [selectedJournal, setSelectedJournal] = createSignal<JournalEntry | null>(null);
  const [isPopupOpen, setIsPopupOpen] = createSignal(false);
  const [journalEntries, setJournalEntries] = createSignal<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = createSignal<JournalEntry[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [gridApi, setGridApi] = createSignal<any | null>(null);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      setLoading(false);
      return;
    }

    fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch journals");
        return res.json();
      })
      .then((data) => {
        const entries = Array.isArray(data) ? data : data.journals || [];
        setJournalEntries(entries);
        setFilteredEntries(entries);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data journal. Silakan login ulang.");
        setLoading(false);
      });
  });

  // Filter entries based on search query
  createEffect(() => {
    const query = searchQuery().toLowerCase();
    if (!query) {
      setFilteredEntries(journalEntries());
    } else {
      setFilteredEntries(
        journalEntries().filter(entry =>
          entry.title.toLowerCase().includes(query)
        )
      );
    }
  });

  createEffect(() => {
    if (isPopupOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });

  const openJournalPopup = (journal: JournalEntry) => {
    setSelectedJournal(journal);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedJournal(null);
  };

  const handleDeleteJournal = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Belum login. Silakan login ulang.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this journal entry?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setError("Gagal menghapus journal.");
        return;
      }
      const updatedEntries = journalEntries().filter((entry) => entry.id !== id);
      setJournalEntries(updatedEntries);
      setFilteredEntries(updatedEntries.filter(entry =>
        entry.title.toLowerCase().includes(searchQuery().toLowerCase())
      ));
      if (selectedJournal() && selectedJournal()!.id === id) {
        closePopup();
      }
    } catch {
      setError("Gagal menghapus journal. Silakan coba lagi.");
    }
  };

  const handleEditJournal = (journal: JournalEntry) => {
    let dateForEdit = journal.created_at;
    if (journal.created_at.includes('T')) {
      const dateOnly = journal.created_at.split('T')[0]; 
      const [yyyy, mm, dd] = dateOnly.split('-');
      dateForEdit = `${mm}-${dd}-${yyyy}`; 
    } else if (journal.created_at.length === 10 && journal.created_at.includes('-')) {
      const parts = journal.created_at.split('-');
      if (parts[0].length === 4) {
        const [yyyy, mm, dd] = parts;
        dateForEdit = `${mm}-${dd}-${yyyy}`;
      }
    }
    
    navigate('/journal/create', { 
      state: { 
        journal,
        date: dateForEdit 
      } 
    });
  };

  // Custom cell renderer for title
  const TitleCellRenderer = (params: any) => {
    return (
      <div class="flex items-center justify-center h-full text-center font-medium text-gray-900">
        {params.data.title}
      </div>
    );
  };

  // Custom cell renderer for date
  const DateCellRenderer = (params: any) => {
    return (
      <div class="flex items-center justify-center h-full text-center">
        {formatDateMMDDYYYY(params.data.created_at)}
      </div>
    );
  };

  // Custom cell renderer for preview
  const PreviewCellRenderer = (params: any) => {
    const content = params.data.content;
    const preview = content.length > 50 ? content.slice(0, 50) + "..." : content;
    return <div class="flex items-center justify-center h-full text-center max-w-xs truncate">{preview}</div>;
  };

  // Custom cell renderer for actions
  const ActionsCellRenderer = (params: any) => {
    const journal = params.data;
    return (
      <div class="flex justify-center items-center gap-2 h-full">
        <button
          onClick={() => openJournalPopup(journal)}
          class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors"
        >
          Read More
        </button>
        <button
          onClick={() => handleEditJournal(journal)}
          class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => handleDeleteJournal(journal.id)}
          class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-xs px-3 py-1.5 transition-colors ml-2"
        >
          Delete
        </button>
      </div>
    );
  };

  // Column definitions for AG Grid
  const columnDefs: any[] = [
    {
      headerName: 'Title',
      field: 'title',
      flex: 2,
      cellRenderer: TitleCellRenderer,
      cellStyle: { 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerClass: 'ag-header-cell-center'
    },
    {
      headerName: 'Date',
      field: 'created_at',
      flex: 1,
      cellRenderer: DateCellRenderer,
      cellStyle: { 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerClass: 'ag-header-cell-center'
    },
    {
      headerName: 'Preview',
      field: 'content',
      flex: 2,
      cellRenderer: PreviewCellRenderer,
      cellStyle: { 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerClass: 'ag-header-cell-center'
    },
    {
      headerName: 'Action',
      field: 'actions',
      flex: 3,
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      cellStyle: { 
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      headerClass: 'ag-header-cell-center'
    }
  ];

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Journal Entries</h1>
          <div class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="w-full sm:w-auto">
              <input
                type="text"
                class="w-full sm:w-64 p-2 border border-gray-300 rounded-lg focus:ring-rose-200 focus:border-rose-700 focus:outline-none"
                placeholder="Search by title..."
                value={searchQuery()}
                onInput={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </div>
            <button
              onClick={() => navigate('/journal/create')}
              class="text-white bg-rose-700 hover:bg-rose-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              New Entry
            </button>
          </div>
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <h5 class="text-xl font-medium text-gray-900 mb-6">Your Journals</h5>
            {loading() ? (
              <div class="text-gray-600">Loading...</div>
            ) : (
              <div class="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
                <style>{`
                  .ag-header-cell-center .ag-header-cell-text {
                    text-align: center !important;
                    justify-content: center !important;
                    width: 100%;
                  }
                  .ag-header-cell-center {
                    text-align: center !important;
                    justify-content: center !important;
                  }
                  .ag-theme-alpine .ag-header {
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                  }
                  .ag-theme-alpine .ag-row {
                    background-color: rgba(255, 255, 255, 0.5);
                    border-bottom: 1px solid #e5e7eb;
                  }
                  .ag-theme-alpine .ag-row:hover {
                    background-color: #f9fafb;
                  }
                  .ag-theme-alpine .ag-root-wrapper {
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                  }
                  .ag-theme-alpine .ag-cell {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  }
                `}</style>
                <AgGrid
                  rowData={filteredEntries()}
                  columnDefs={columnDefs}
                  onGridReady={onGridReady}
                  animateRows={true}
                  suppressCellFocus={true}
                  noRowsOverlayComponent={() => (
                    <div class="flex items-center justify-center h-full text-gray-500">
                      No journal entries found.
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Journal Popup Modal */}
      {isPopupOpen() && selectedJournal() && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={closePopup}
              class="absolute top-3 right-3 text-gray-400 hover:text-rose-700"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div class="mb-4">
              <span class="font-medium">Title:</span> {selectedJournal()!.title}
            </div>
            <div class="mb-2">
              <span class="font-medium">Date:</span> {formatDateMMDDYYYY(selectedJournal()!.created_at)}
            </div>
            <div class="mb-2">
              <span class="font-medium">Content:</span>
              <div class="mt-1 whitespace-pre-line break-words">{selectedJournal()!.content}</div>
            </div>
            <div class="flex justify-end mt-6 gap-2">
              <button
                onClick={() => handleEditJournal(selectedJournal()!)}
                class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-xs px-4 py-2 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Journal;