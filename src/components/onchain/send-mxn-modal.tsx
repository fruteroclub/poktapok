import { useEffect, useState } from 'react'
import {
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import config from '@/config'

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
import { toast } from 'sonner'
import Erc20TokenAbi from '@/contracts/ERC20TokenAbi'
import { ExternalLinkIcon, SendIcon } from 'lucide-react'
import Link from 'next/link'

type SendMxnModalProps = {
  mxnBalance: {
    decimals: number;
    formatted: string;
    symbol: string;
    value: bigint
  }
  refetchMxnBalance: () => Promise<void>
  userAddress: `0x${string}` | undefined
}

export default function SendMxnModal({
  mxnBalance,
  refetchMxnBalance,
  userAddress,
}: SendMxnModalProps) {
  const { xoc } = config.tokens

  const [toAddress, setToAddress] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')

  const { data: hash, isPending, writeContractAsync } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  async function submitTransferErc20(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!userAddress) {
      toast.warning('You must connect your wallet...')
      return
    }
    if (!mxnBalance.value) {
      toast.warning('You must have a mxnBalance of $PULPA to send...')
      return
    }
    try {
      await writeContractAsync({
        abi: Erc20TokenAbi,
        address: xoc.address,
        functionName: 'transfer',
        args: [toAddress as `0x${string}`, parseEther(tokenAmount)],
      })
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchMxnBalance()
      toast.success(`Sent ${tokenAmount} $PULPA`)
    }
  }, [isConfirmed, refetchMxnBalance, tokenAmount])

  const status = isPending
    ? 'enviando'
    : isConfirming
      ? 'confirmando'
      : 'enviar'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg" className="flex items-center gap-x-1.5">
          enviar
          <SendIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-primary">enviar</DialogTitle>
          <DialogDescription>
            el monto ingresado será enviado a la dirección una vez que presiones
            el botón enviar
          </DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-4">
          <div className="flex items-end gap-x-4">
            <p className="text-xl">balance actual:</p>
            {mxnBalance.value ? (
              <div className="flex items-end gap-x-2">
                <p className="text-3xl font-medium font-funnel">
                  {parseFloat(formatEther(mxnBalance.value as bigint)).toFixed(2)}
                </p>
                <p className="text-xl font-medium">MXN</p>
              </div>
            ) : (
              <p>cargando...</p>
            )}
          </div>
          <form
            className="flex w-full flex-col gap-y-8"
            onSubmit={submitTransferErc20}
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
                  onChange={(event) => setTokenAmount(event.target.value)}
                />
              </div>
            </div>
            <div className="flex w-full justify-center">
              <Button type="submit" disabled={isPending || isConfirming}>
                {status}
              </Button>
            </div>
          </form>
          {hash && (
            <div className="flex flex-col items-center pt-8">
              <Link
                className="flex items-center gap-x-1.5 hover:text-accent"
                href={`${xoc.chains.base.blockExplorers?.default.url}/tx/${hash}`}
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
      </DialogContent>
    </Dialog>
  )
}
