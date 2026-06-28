import { useEffect, useState } from 'react';

import { api } from 'services/api';

import { useModal } from 'components/common/Modal';

import { useAsyncData } from 'hooks/useAsyncData';

import UserBorrowsContent from 'components/users/UserBorrowsContent';

import UserExtensionModal from 'components/users/UserExtensionModal';

import { filterByBookTitle, paginateItems } from 'utils/pagination';
import { countBorrowsByStatus, filterBorrowsByStatus } from 'utils/borrowFilterParams';



function parseBorrowsResponse(data) {

  if (Array.isArray(data)) {

    return { borrows: data };

  }

  return { borrows: data.borrows ?? [] };

}



export default function UserBorrows() {

  const { data, error, loading, reload, setError } = useAsyncData(

    () => api.getMyBorrows().then(parseBorrowsResponse),

    [],

  );

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);

  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const modal = useModal();



  const allBorrows = data?.borrows ?? [];

  const statusCounts = countBorrowsByStatus(allBorrows);

  const statusFilteredBorrows = filterBorrowsByStatus(allBorrows, statusFilter);

  const filteredBorrows = filterByBookTitle(statusFilteredBorrows, search);

  const pagination = paginateItems(filteredBorrows, page);



  useEffect(() => {

    if (page !== pagination.page) setPage(pagination.page);

  }, [page, pagination.page]);



  const handleSearchChange = (value) => {

    setSearch(value);

    setPage(1);

  };



  const handleStatusChange = (status) => {

    setStatusFilter(status);

    setPage(1);

  };



  function openExtension(borrow) {

    if (!borrow.can_extend) return;

    setSelected(borrow);

    setReason('');

    setError('');

    modal.open();

  }



  async function submitExtension(e) {

    e.preventDefault();

    if (!selected?.can_extend) return;

    setSubmitting(true);

    setError('');

    try {

      await api.submitExtensionRequest({

        borrow_id: selected.id,

        reason,

      });

      modal.close();

      reload();

    } catch (err) {

      setError(err.message);

    } finally {

      setSubmitting(false);

    }

  }



  if (loading) return <div className="loading">Loading borrows...</div>;



  return (

    <div className="page">

      {error && <div className="error-banner">{error}</div>}



      <UserBorrowsContent

        borrows={pagination.items}

        search={search}

        statusFilter={statusFilter}

        statusCounts={statusCounts}

        total={pagination.total}

        totalAll={allBorrows.length}

        start={pagination.start}

        end={pagination.end}

        page={pagination.page}

        totalPages={pagination.totalPages}

        startPage={pagination.startPage}

        endPage={pagination.endPage}

        pageNumbers={pagination.pageNumbers}

        onSearchChange={handleSearchChange}

        onStatusChange={handleStatusChange}

        onPageChange={setPage}

        onOpenExtension={openExtension}

      />



      <UserExtensionModal

        isOpen={modal.isOpen}

        selected={selected}

        reason={reason}

        submitting={submitting}

        onClose={modal.close}

        onSubmit={submitExtension}

        onReasonChange={setReason}

      />

    </div>

  );

}


