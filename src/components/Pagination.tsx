import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 1 && styles.buttonDisabled]}
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#ccc' : '#666'} />
      </TouchableOpacity>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <Text key={`ellipsis-${index}`} style={styles.ellipsis}>
              ...
            </Text>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <TouchableOpacity
            key={pageNum}
            style={[styles.pageButton, isActive && styles.pageButtonActive]}
            onPress={() => onPageChange(pageNum)}
          >
            <Text style={[styles.pageButtonText, isActive && styles.pageButtonTextActive]}>
              {pageNum}
            </Text>
          </TouchableOpacity>
        )
      })}

      <TouchableOpacity
        style={[styles.button, currentPage === totalPages && styles.buttonDisabled]}
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#ccc' : '#666'} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageButton: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonActive: {
    backgroundColor: '#FF7A00',
  },
  pageButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  pageButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ellipsis: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 4,
  },
})

