import { useEffect, useState } from 'react'
import {
  UseBalanceReturnType,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { Chain, formatEther, parseEther } from 'viem'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import Link from 'next/link'
import { ExternalLinkIcon } from 'lucide-react'
import { toast } from 'sonner'

type SendErc20ModalProps = {
  accountBalance: UseBalanceReturnType<{
    decimals: number
    formatted: string
    symbol: string
    value: bigint
  }>
  chain?: Chain
}

export default function SendNativeTokenModal({
  accountBalance,
  chain,
}: SendErc20ModalProps) {
  const [toAddress, setToAddress] = useState('')
  const [ethValue, setEthValue] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const { data: hash, isPending, sendTransaction } = useSendTransaction()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  async function submitSendTx(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (
      parseFloat(formatEther(accountBalance.data?.value ?? BigInt(0))) === 0
    ) {
      return toast.warning("you don't have enough POL balance")
    }
    sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(ethValue),
    })
  }

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
    }
  }, [isMounted])

  function renderBalance() {
    const rawBalance = accountBalance.data?.value ?? BigInt(0)
    const balance = parseFloat(formatEther(rawBalance))
    // Show 0.00 and 'balance muy bajo' if less than 0.000001
    if (balance < 0.000001)
      return (
        <>
          <h2>0.00</h2>
          <h4>{chain?.nativeCurrency.symbol ?? 'ETH'}</h4>
          <span className="mt-1 text-xs text-destructive">
            balance muy bajo
          </span>
        </>
      )
    // Dynamically determine decimals to show the least significant digit
    let decimals = 2
    if (balance < 1) {
      // Count significant decimals
      const str = balance.toString()
      const [, dec] = str.split('.')
      if (dec) {
        // Find first non-zero digit after decimal
        const firstNonZero = dec.search(/[^0]/)
        decimals = Math.max(firstNonZero + 3, 2) // show 3 digits after first non-zero
        decimals = Math.min(decimals, 18) // never more than 18
      }
    }
    return (
      <>
        <h2>{balance.toFixed(decimals)}</h2>
        <h4>{chain?.nativeCurrency.symbol ?? 'ETH'}</h4>
      </>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>enviar {chain?.nativeCurrency.symbol ?? 'ETH'}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            enviar {chain?.nativeCurrency.symbol ?? 'ETH'}
          </DialogTitle>
          <DialogDescription className="text-left">
            el monto ingresado será enviado a la dirección una vez que presiones
            el botón enviar
          </DialogDescription>
        </DialogHeader>
        {isMounted ? (
          <div className="w-full">
            <div className="flex flex-col text-center">{renderBalance()}</div>
            <form
              className="flex w-full flex-col gap-y-8"
              onSubmit={submitSendTx}
            >
              <div className="flex w-full flex-col gap-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="address">dirección</Label>
                  <Input
                    name="address"
                    placeholder="0xA0Cf…251e"
                    required
                    onChange={(event) => setToAddress(event.target.value)}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="value">cantidad</Label>
                  <Input
                    name="value"
                    placeholder="0.05"
                    required
                    onChange={(event) => setEthValue(event.target.value)}
                  />
                </div>
              </div>
              <div className="flex w-full justify-center">
                <Button type="submit" disabled={isPending || isConfirming}>
                  {isPending ? 'confirmando...' : 'enviar'}
                </Button>
              </div>
            </form>
            {hash && (
              <div className="flex flex-col items-center pt-8">
                <Link
                  className="flex items-center gap-x-1.5 hover:text-accent"
                  href={`https://${chain?.blockExplorers?.default.name}.com/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ver tx en explorador <ExternalLinkIcon className="h4 w-4" />
                </Link>
                {isConfirming && <div>esperando confirmación...</div>}
                {isConfirmed && <div>transacción confirmada</div>}
              </div>
            )}
          </div>
        ) : (
          <p>cargando...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
