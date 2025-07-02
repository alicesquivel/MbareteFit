import React, { useState } from "react";
import { Modal } from "./Modal";
import { formatWeight } from "../utils/helpers";

export default function HistoryTable({ weightData, units, setWeightData }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (!entryToDelete) return;
    setWeightData((prevData) =>
      prevData.filter((e) => e.id !== entryToDelete.id)
    );
    setModalOpen(false);
    setEntryToDelete(null);
  };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-md relative min-h-[300px]">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {weightData.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-slate-100">Date & Time</th>
                  <th className="py-2 px-4 bg-slate-100">Weight</th>
                  <th className="py-2 px-4 bg-slate-100">Notes</th>
                  <th className="py-2 px-4 bg-slate-100"></th>
                </tr>
              </thead>
              <tbody>
                {[...weightData]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-200">
                      <td className="py-3 px-4">
                        {new Date(entry.date).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatWeight(entry.weight, units)}
                      </td>
                      <td
                        className="py-3 px-4 italic truncate"
                        title={entry.note}
                      >
                        {entry.note}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(entry)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            History appears here.
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-2">Delete Entry?</h2>
        <p className="text-slate-600 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setModalOpen(false)}
            className="bg-slate-200 text-slate-800 font-semibold py-2 px-6 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
